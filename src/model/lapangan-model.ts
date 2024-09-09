export type CreateLapangan = {
    name: string;
    picture: string;
    description: string;
    address: {
        alamat: string;
        longtitude: string;
        latitude: string;
    };
    open: string;
    close: string;
    userId: string;
}