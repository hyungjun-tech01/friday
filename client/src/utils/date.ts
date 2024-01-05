export const getDateStringForDB = (date : Date | null) => {
    if(date) {
        const t_M = date.getMonth() + 1;
        const t_d = date.getDate();
        const t_h = date.getHours();
        const t_m = date.getMinutes();
        const t_s = date.getSeconds();

        return (
          date.getFullYear() +
          '-' +
          (t_M < 10 ? '0' + t_M : t_M) +
          '-' +
          (t_d < 10 ? '0' + t_d : t_d) +
          ' ' +
          (t_h < 10 ? '0' + t_h : t_h) +
          ':' +
          (t_m < 10 ? '0' + t_m : t_m) +
          ':' +
          (t_s < 10 ? '0' + t_s : t_s)
        );
    }
    return '-1';
}