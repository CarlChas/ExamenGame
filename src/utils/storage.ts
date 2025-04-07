export const getCurrentUser = () => {
    const username = localStorage.getItem('currentUser');
    if (!username) return null;

    const user = localStorage.getItem(`user:${username}`);
    return user ? JSON.parse(user) : null;
};

export const saveUser = (user: any) => {
    if (!user?.username) return;
    localStorage.setItem(`user:${user.username.toLowerCase()}`, JSON.stringify(user));
};
