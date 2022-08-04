export type IncompleteHouse = {
    id: string,
    name: string,
    rif: number,
    address: string,
    phones: string[],
    maxShares: number,
    minimumAge: number,
    maximumAge: number,
    currentShares: number,
    currentGirlsHelped: number,
    currentBoysHelped: number,
    scheduleStartTime: string,
    scheduleEndTime: string,
    contactCI: number
}

export type Contact = {
    ci: number,
    name: string,
    lastname: string
}

export type House = Omit<IncompleteHouse, "contactCI"> & {
    contact: Contact
}

type Phone = {
    value: string
}

export type HouseForm = {
    houseName: string,
    houseRif: string
    houseAddress: string,
    houseImage: FileList,
    housePhones: Phone[]
    houseMaxShares: string,
    houseMinimumAge: string,
    houseMaximumAge: string
    houseScheduleStartTime: string
    houseScheduleEndTime: string
    // Contact Information
    houseContactCI: number,
    houseContactLastname: string
    houseContactName: string
}

export type UpdateForm<T extends keyof House | "contactCI"> = {
    [P in T]: P extends "contactCI" ? number : House[Exclude<P, "contactCI">]
}
