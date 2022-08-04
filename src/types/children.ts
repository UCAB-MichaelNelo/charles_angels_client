import {House} from "./houses";

export type PersonalInformation = {
    ci: string,
    name: string,
    lastname: string,
    birthdate: string
}

export type Attire = {
    shortOrTrousersSize: number,
    tshirtOrshirtSize: number,
    sweaterSize: number | null,
    dressSize: number | null,
    footwearSize: number
}

export type Child = {
    houseId: string | null,
    id: string,
    sex: string,
    information: PersonalInformation,
    mother: PersonalInformation | null,
    father: PersonalInformation | null,
    nonParent: PersonalInformation | null,
    relBen: string[],
    attire: Attire
}

export type PersonalInformationOfChild = {
    information: PersonalInformation
    childId: string
}

export type HouseSelection = { id: "none" } | House

export type FormChild = Omit<Child, "relBen"> & { photo: FileList | null, relBen: { value: string }[] }