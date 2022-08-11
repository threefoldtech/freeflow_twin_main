export const hasSpecialCharacters = (name: string) => {
    const format = /[`!@#$%^*=[\]{};':"\\|<>\/?~]/;
    return format.test(name);
};
