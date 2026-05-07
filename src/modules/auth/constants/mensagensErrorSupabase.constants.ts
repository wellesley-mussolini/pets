/**
 * Mensagens de erro literais devolvidas pelo Supabase Auth (em inglês).
 * Servem para comparação com `error.message` na validação de erros de autenticação.
 */
export const mensagensErroSupabaseAuth = {
  credenciaisInvalidas: "Invalid login credentials",
  emailNaoConfirmado: "Email not confirmed",
} as const;
