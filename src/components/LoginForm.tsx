
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChartLine } from "lucide-react";
import { openProjectAPI } from "@/lib/api";
import { useNavigate } from "react-router-dom";

export function LoginForm() {
  const [url, setUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      openProjectAPI.setCredentials({ url, apiKey });
      
      // Test the connection by fetching projects
      await openProjectAPI.getProjects();
      
      // If we get here, the credentials are valid
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setError("Conexión fallida. Verifica la URL y la API Key proporcionadas.");
      openProjectAPI.clearCredentials();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-6">
            <ChartLine className="h-10 w-10 text-project-600" />
            <span className="text-2xl font-bold ml-2 text-project-800">OpenPro Tracker</span>
          </div>
          <CardTitle className="text-2xl text-center">Bienvenido</CardTitle>
          <CardDescription className="text-center">
            Conecta con tu instancia de OpenProject para comenzar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL de OpenProject</Label>
              <Input
                id="url"
                placeholder="https://tu-instancia.openproject.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Tu API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </form>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full bg-project-600 hover:bg-project-700" 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Conectando..." : "Conectar"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
