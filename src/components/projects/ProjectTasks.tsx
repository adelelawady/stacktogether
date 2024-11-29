import { useEffect, useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskList } from "./TaskList";
import { NewTaskDialog } from "./NewTaskDialog";
import { ProjectTaskLists } from "./ProjectTaskLists";
import { supabase } from "@/integrations/supabase/client";
import type { TaskListWithDetails } from "@/types/project.types";
import { TaskDetails } from "./TaskDetails";
import { Card } from "@/components/ui/card";

interface ProjectTasksProps {
  projectId: string;
  onTaskSelect: (taskId: string | null) => void;
  selectedTaskId: string | null;
  onTaskListsUpdate: (lists: TaskListWithDetails[]) => void;
}

export function ProjectTasks({ projectId, onTaskSelect, selectedTaskId, onTaskListsUpdate }: ProjectTasksProps) {
  const [taskLists, setTaskLists] = useState<TaskListWithDetails[]>([]);
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingLists, setLoadingLists] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadTaskLists();
  }, [projectId]);

  const loadTaskLists = async () => {
    setIsLoading(true);
    console.log("Loading task lists for project:", projectId);

    // First, get just the task lists
    let { data: lists, error: listsError } = await supabase
      .from('task_lists')
      .select('*')
      .eq('project_id', projectId)
      .order('position');

    if (listsError) {
      console.error('Error loading task lists:', listsError);
      setIsLoading(false);
      return;
    }

    console.log("Task lists found:", lists);

    if (!lists || lists.length === 0) {
      // Create default task lists if none exist
      const defaultLists = [
        { name: 'To Do', type: 'todo', position: 0 },
        { name: 'In Progress', type: 'in_progress', position: 1 },
        { name: 'Review', type: 'review', position: 2 },
        { name: 'Done', type: 'done', position: 3 }
      ];

      for (const list of defaultLists) {
        const { error: createError } = await supabase
          .from('task_lists')
          .insert({
            ...list,
            project_id: projectId
          });

        if (createError) {
          console.error('Error creating default list:', createError);
        }
      }

      // Retry loading after creating defaults
      const { data: newLists, error: newListsError } = await supabase
        .from('task_lists')
        .select('*')
        .eq('project_id', projectId)
        .order('position');

      if (newListsError) {
        console.error('Error loading new task lists:', newListsError);
        return;
      }

      lists = newLists;
    }

    // Initialize loading states for each list
    const initialLoadingStates = lists.reduce((acc, list) => ({
      ...acc,
      [list.id]: true
    }), {});
    setLoadingLists(initialLoadingStates);

    // Now get tasks for each list
    const listsWithTasks = await Promise.all(lists.map(async (list) => {
      try {
        const { data: tasks, error: tasksError } = await supabase
          .from('tasks')
          .select(`
            *,
            created_by_profile:profiles!tasks_created_by_fkey(
              id, full_name, avatar_url, avatar_style
            ),
            assigned_to_profile:profiles!tasks_assigned_to_fkey(
              id, full_name, avatar_url, avatar_style
            )
          `)
          .eq('list_id', list.id)
          .order('position');

        if (tasksError) throw tasksError;

        // Get comments for each task
        const tasksWithComments = await Promise.all((tasks || []).map(async (task) => {
          const { data: comments, error: commentsError } = await supabase
            .from('comments')
            .select(`
              *,
              profile:profiles(*),
              comment_reactions(
                *,
                profile:profiles(*)
              )
            `)
            .eq('task_id', task.id)
            .order('created_at');

          if (commentsError) {
            console.error('Error loading comments for task:', task.id, commentsError);
            return { ...task, comments: [] };
          }

          return {
            ...task,
            comments: comments || []
          };
        }));

        // Mark this list as loaded
        setLoadingLists(prev => ({
          ...prev,
          [list.id]: false
        }));

        return {
          ...list,
          tasks: tasksWithComments || []
        };
      } catch (error) {
        console.error('Error loading tasks for list:', list.id, error);
        setLoadingLists(prev => ({
          ...prev,
          [list.id]: false
        }));
        return { ...list, tasks: [] };
      }
    }));

    console.log("Final lists with tasks:", listsWithTasks);
    setTaskLists(listsWithTasks);
    onTaskListsUpdate(listsWithTasks);
    setIsLoading(false);
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    // If dropped in the same list, just reorder
    if (source.droppableId === destination.droppableId) {
      const listIndex = taskLists.findIndex(list => list.id === source.droppableId);
      const newTasks = Array.from(taskLists[listIndex].tasks);
      const [removed] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, removed);

      // Update positions
      const updates = newTasks.map((task, index) => ({
        id: task.id,
        position: index,
      }));

      const { error } = await supabase
        .from('tasks')
        .upsert(updates, { onConflict: 'id' });

      if (error) {
        console.error('Error updating task positions:', error);
        return;
      }
    } else {
      // Moving between lists
      const sourceListIndex = taskLists.findIndex(list => list.id === source.droppableId);
      const destListIndex = taskLists.findIndex(list => list.id === destination.droppableId);
      
      const sourceTasks = Array.from(taskLists[sourceListIndex].tasks);
      const destTasks = Array.from(taskLists[destListIndex].tasks);
      
      const [removed] = sourceTasks.splice(source.index, 1);
      destTasks.splice(destination.index, 0, removed);

      // Update task list and positions
      const { error } = await supabase
        .from('tasks')
        .update({
          list_id: destination.droppableId,
          position: destination.index,
        })
        .eq('id', draggableId);

      if (error) {
        console.error('Error moving task between lists:', error);
        return;
      }
    }

    // Reload lists to get updated data
    loadTaskLists();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Tasks</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4 space-y-4">
              <div className="animate-pulse">
                <div className="h-6 bg-muted rounded w-24" />
                <div className="space-y-3 mt-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-20 bg-muted rounded" />
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <ProjectTaskLists projectId={projectId} onListCreated={loadTaskLists} />
      </div>

      <div className="space-y-6">
        {/* Task Lists */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            {taskLists.map((list) => (
              <TaskList
                key={list.id}
                list={list}
                onTaskUpdate={loadTaskLists}
                onTaskSelect={onTaskSelect}
                selectedTaskId={selectedTaskId}
                isLoading={loadingLists[list.id]}
              />
            ))}
          </DragDropContext>
        </div>

        {/* Task Details */}
        {selectedTaskId && (
          <div className="mt-6">
            <TaskDetails
              taskId={selectedTaskId}
              onClose={() => onTaskSelect(null)}
              onUpdate={loadTaskLists}
            />
          </div>
        )}
      </div>
    </div>
  );
} 