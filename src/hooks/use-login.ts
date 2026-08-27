import { useMutation } from '@tanstack/react-query';
import { AuthService } from '@/services/auth.service';
import { LoginRequest, AuthResponse } from '@/types/auth';

export function useLogin() {
  return useMutation<AuthResponse, Error, LoginRequest>({
    mutationFn: (request) => AuthService.login(request),
  });
}
