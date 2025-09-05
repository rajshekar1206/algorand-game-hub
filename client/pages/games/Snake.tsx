import Layout from "@/components/Layout";
import SnakeGame from "@/components/games/SnakeGame";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function SnakePage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link to="/games">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Games
            </Link>
          </Button>
        </div>

        <SnakeGame />
      </div>
    </Layout>
  );
}
