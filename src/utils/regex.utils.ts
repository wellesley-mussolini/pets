export const regexUtils = {
    manterApenasNumeros: (valor: string): string => valor.replace(/\D/g, ""),
  
    manterApenasLetrasSemCaracteresEspeciais: (letra: string): string => letra.replace(/[^a-zA-Z]/g, ""),
  };