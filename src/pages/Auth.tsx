import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Sign in | FRIDGE CHEF";
  }, []);

  useEffect(() => {
    if (session) {
      navigate("/app", { replace: true });
    }
  }, [session, navigate]);

  const handleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome back!", description: "Signed in successfully." });
      navigate("/app", { replace: true });
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Check your inbox",
        description: "Confirm your email to complete sign up.",
      });
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md glass-card">
        <CardHeader>
          <CardTitle className="text-center">Sign in to FRIDGE CHEF</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4 pt-4">
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email"
              />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-label="Password"
              />
              <Button className="w-full" onClick={handleSignIn} disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => navigate("/")}>Back to home</Button>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 pt-4">
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email"
              />
              <Input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-label="Password"
              />
              <Button className="w-full" onClick={handleSignUp} disabled={loading}>
                {loading ? "Signing up..." : "Create account"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                By creating an account you agree to our terms.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
};

export default Auth;
