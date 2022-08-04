export type PersonalInformation = {
    ci: number,
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
    id: string,
    sex: string,
    information: PersonalInformation,
    mother: PersonalInformation | null,
    father: PersonalInformation | null,
    nonParent: PersonalInformation | null,
    relBen: PersonalInformation[],
    attire: Attire
}

export type FormChild = Child & { photo: FileList | null, houseId: string }