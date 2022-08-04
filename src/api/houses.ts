import {Contact, House, HouseForm, IncompleteHouse, UpdateForm} from "../types/houses";

export function createHouse(form: HouseForm): Promise<Response | undefined> {
    const file = form.houseImage[0],
        [ext, _] = file.name.split(".").reverse(),
        house = {
            fileExtension: ext,
            name: form.houseName,
            rif: form.houseRif,
            address: form.houseAddress,
            phones: form.housePhones.map(({value}) => value),
            maxShares: form.houseMaxShares,
            minimumAge: form.houseMinimumAge,
            maximumAge: form.houseMaximumAge,
            currentShares: 0,
            currentGirlsHelped: 0,
            currentBoysHelped: 0,
            scheduleStartTime: form.houseScheduleStartTime,
            scheduleEndTime: form.houseScheduleEndTime
        },
        contact = {
            ci: form.houseContactCI,
            name: form.houseContactName,
            lastname: form.houseContactLastname
        }

    return fetch(`${import.meta.env.VITE_API_BASE_PATH}/houses/image?ext=${ext}&rif=${form.houseRif}`, {
        method: "PUT",
        body: file,
        mode: "same-origin"
    }).then(response => {
            if (response.ok)
                return fetch(`${import.meta.env.VITE_API_BASE_PATH}/houses`, {
                    method: "POST",
                    body: JSON.stringify({
                        house,
                        contact
                    }),
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
            else {
                window.alert("Error uploading image file")
            }
        }
    )
}

export function isRIFUnique(rif: number) {
    return fetch(`${import.meta.env.VITE_API_BASE_PATH}/houses/${rif}`, { mode: "same-origin" })
        .then(response => response.ok)
}

export function getAllAvailableCis(): Promise<Record<number, Contact>> {
    return fetch(`${import.meta.env.VITE_API_BASE_PATH}/contacts`, { mode: "same-origin" })
        .then(response => response.json())
        .then(contacts =>
            contacts.reduce((map: Record<number, Contact>, contact: Contact) => {
                return Object.assign(map, { [contact.ci]: contact })
            }, {})
        )
}

export function getHouses(): Promise<House[]> {
    return fetch(`${import.meta.env.VITE_API_BASE_PATH}/houses`, { mode: "same-origin" })
        .then(response => response.json())
        .then(async (incompleteHouses: IncompleteHouse[]) => {
            return Promise.all(incompleteHouses.map(async incompleteHouse => {
                const contact = await getContact(incompleteHouse.contactCI)

                return { contact, ...incompleteHouse }
            }))
        })
}

export function getHouse(id: string): Promise<IncompleteHouse> {
    return fetch(`${import.meta.env.VITE_API_BASE_PATH}/houses/${id}`, { mode: "same-origin" })
        .then(response => response.json())
}


export function getHousesAvailableForBeneficiaries(birthdate: string): Promise<IncompleteHouse[]> {
    return fetch(`${import.meta.env.VITE_API_BASE_PATH}/houses?birthdate=${birthdate}`, { mode: "same-origin" })
        .then(response => response.json())
}

export function getContact(ci: number): Promise<Contact> {
    return fetch(`${import.meta.env.VITE_API_BASE_PATH}/contacts/${ci}`, { mode: "same-origin" })
        .then(response => response.json())
}

export function getHouseImageUrl({ id }: House) {
    return `${import.meta.env.VITE_API_BASE_PATH}/houses/${id}/image?${performance.now()}`
}

function updateHouseAttribute<T extends keyof House | "contactCI">(id: string, body: UpdateForm<T>) {
    const key = Object.keys(body)[0]
    return fetch(`${import.meta.env.VITE_API_BASE_PATH}/houses/${id}/${key}`, {
        method: 'PATCH',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
        mode: "same-origin"
    }).then(response => response.ok)
}

function addPhoneToHouse(id: string, phone: string) {
    return fetch(`${import.meta.env.VITE_API_BASE_PATH}/houses/${id}/phone`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ phone }),
        mode: "same-origin"
    }).then(response => response.ok)
}

function removePhoneFromHouse(id: string, index: number) {
    return fetch(`${import.meta.env.VITE_API_BASE_PATH}/houses/${id}/phone`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ index }),
        mode: "same-origin"
    }).then(response => response.ok)
}

function updateHouseImage(id: string, image: File) {
    const [ext, _] = image.name.split(".").reverse()
    return fetch(`${import.meta.env.VITE_API_BASE_PATH}/houses/${id}/image?ext=${ext}`, {
        method: "PATCH",
        body: image,
        mode: "same-origin"
    }).then(response => response.ok)
}

export async function updateHouse(form: HouseForm, house: House): Promise<[boolean, string]> {
    const rif = Number(form.houseRif),
        maxShares = Number(form.houseMaxShares),
        maximumAge = Number(form.houseMaximumAge),
        minimumAge = Number(form.houseMinimumAge),
        phones = form.housePhones.map(({ value }) => value)

    if (form.houseName != house.name)
        if (!await updateHouseAttribute(house.id, { name: form.houseName }))
            return [false, "Nombre"]
    if (form.houseImage && form.houseImage[0])
        if (!await updateHouseImage(house.id, form.houseImage[0]))
            return [false, "Imagen"]
    if (rif != house.rif)
        if (!await updateHouseAttribute(house.id, { rif }))
            return [false, "RIF"]
    if (form.houseAddress != house.address)
        if (!await updateHouseAttribute(house.id, { address: form.houseAddress }))
            return [false, "Dirección"]
    if (JSON.stringify(phones) != JSON.stringify(house.phones)) {
        const currentPhonesSet = new Set(house.phones),
            updatedPhonesSet = new Set(phones),
            addedPhones = phones.filter(phone => !currentPhonesSet.has(phone)),
            deletedPhonesIndexes = house.phones
                .map((phone, ind) => [phone, ind] as [string, number])
                .filter(([phone, _]: [string, number]) => !updatedPhonesSet.has(phone))
                .map(([_, ind]) => ind)

        const deleteResults =
            await Promise.all(deletedPhonesIndexes.map(index => removePhoneFromHouse(house.id, index))),
            addedResults = await Promise.all(addedPhones.map(phone => addPhoneToHouse(house.id, phone)))

        if (deleteResults.find(r => !r) || addedResults.find(r => !r))
            return [false, "Telefonos"]
    }
    if (maxShares != house.maxShares)
        if (!await updateHouseAttribute(house.id, { maxShares }))
            return [false, "Cupos máximos"]
    if (maximumAge != house.maximumAge)
        if (!await updateHouseAttribute(house.id, { maximumAge }))
            return [false, "Edad máxima"]
    if (minimumAge != house.minimumAge)
        if (!await updateHouseAttribute(house.id, { minimumAge }))
            return [false, "Edad mínima"]
    if (form.houseScheduleStartTime != house.scheduleStartTime)
        if (!await updateHouseAttribute(house.id, { scheduleStartTime: form.houseScheduleStartTime }))
            return [false, "Tiempo de inicio del horario de atención"]
    if (form.houseScheduleEndTime != house.scheduleEndTime)
        if (!await updateHouseAttribute(house.id, { scheduleEndTime: form.houseScheduleEndTime }))
            return [false, "Tiempo de fin del horario de atención"]
    if (form.houseContactCI != house.contact.ci)
        if (!await updateHouseAttribute(house.id, { contactCI: form.houseContactCI }))
            return [false, "Cédula de identidad de contacto"]

    return [true, ""]
}

export function deleteHouse(house: House) {
    return fetch(`${import.meta.env.VITE_API_BASE_PATH}/houses/${house.id}`, {
        method: "DELETE",
        mode: "same-origin"
    })
}