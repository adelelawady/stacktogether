import { Search, User, LogIn } from "lucide-react";
import { Link } from "react-router-dom";

const Navigation = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-primary">StackConnect</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-500 hover:text-primary transition-colors">
              <Search className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-primary transition-colors">
              <User className="h-5 w-5" />
            </button>
            <button className="flex items-center px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90 transition-colors">
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;