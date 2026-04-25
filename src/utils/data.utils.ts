type FormatoDataOptions = Partial<Intl.DateTimeFormatOptions>;

type DataUtils = {
    formatarDataParaPtBr: (date: Date, options?: FormatoDataOptions) => string;
};

const FormatoDefaultData: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
};

export const dataUtils: DataUtils = {
    formatarDataParaPtBr: (date, options) => {
        return date.toLocaleDateString("pt-BR", {
            ...FormatoDefaultData,
            ...options,
        });
    },
};