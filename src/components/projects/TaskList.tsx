import { useState } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TaskCard } from "./TaskCard";
import { NewTaskDialog } from "./NewTaskDialog";
import type { TaskListWithDetails } from "@/types/project.types";

interface TaskListProps {
  list: TaskListWithDetails;
  onTaskUpdate: () => void;
  onTaskSelect: (taskId: string) => void;
  selectedTaskId: string | null;
}

export function TaskList({ list, onTaskUpdate, onTaskSelect, selectedTaskId }: TaskListProps) {
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);

  return (
    <Droppable droppableId={list.id}>
      {(provided) => (
        <Card className="bg-muted/50">
          <CardHeader className="p-3">
            <CardTitle className="text-sm font-medium">
              {list.name} ({list.tasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent 
            className="p-2 space-y-2"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {list.tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <TaskCard 
                      task={task} 
                      onSelect={onTaskSelect}
                      isSelected={task.id === selectedTaskId}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground"
              onClick={() => setIsNewTaskDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </CardContent>

          <NewTaskDialog
            projectId={list.project_id}
            listId={list.id}
            open={isNewTaskDialogOpen}
            onOpenChange={setIsNewTaskDialogOpen}
            onTaskCreated={onTaskUpdate}
          />
        </Card>
      )}
    </Droppable>
  );
} 