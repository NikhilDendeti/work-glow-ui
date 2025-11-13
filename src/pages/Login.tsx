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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>Enter your employee code to access the dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employee-code">Employee Code</Label>
              <Input
                id="employee-code"
                type="text"
                placeholder="e.g., CEO001, HOD001, PL001, EMP001"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                disabled={loginMutation.isPending}
                autoFocus
                required
              />
              <p className="text-xs text-muted-foreground">
                Test users: CEO001, HOD001, PL001, EMP001
              </p>
            </div>
            {loginMutation.isError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {loginMutation.error instanceof Error
                  ? loginMutation.error.message
                  : 'Invalid employee code. Please try again.'}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
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

