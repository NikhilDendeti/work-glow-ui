import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useLogin } from '@/hooks/api/useAuth';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const [employeeCode, setEmployeeCode] = useState('');
  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (employeeCode.trim()) {
      loginMutation.mutate(employeeCode.trim());
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background p-4">
      <Card className="w-full max-w-md shadow-xl border-primary/20 bg-gradient-to-br from-card to-card/50">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
            <span className="text-3xl">🏢</span>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">OrgContributions</CardTitle>
          <CardDescription className="text-base">Enter your employee code to access the dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employee-code" className="font-medium">Employee Code</Label>
              <Input
                id="employee-code"
                type="text"
                placeholder="e.g., CEO001, HOD001, PL001, EMP001"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                disabled={loginMutation.isPending}
                autoFocus
                required
                className="border-primary/20 focus:border-primary focus:ring-primary/20"
              />
              <p className="text-xs text-muted-foreground">
                Test users: CEO001, HOD001, PL001, EMP001
              </p>
            </div>
            {loginMutation.isError && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                {loginMutation.error instanceof Error
                  ? loginMutation.error.message
                  : 'Invalid employee code. Please try again.'}
              </div>
            )}
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

