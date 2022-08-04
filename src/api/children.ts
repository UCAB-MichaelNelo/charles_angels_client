import {Attire, Child, FormChild, PersonalInformation, PersonalInformationOfChild} from "../types/children";

export function getChild(id: string): Promise<Child> {
    return fetch(`${import.meta.env.VITE_API_BASE_PATH}/children/${id}`, { mode: "same-origin" })
        .then(response => response.json())
}

export function getChildren(houseId: string): Promise<Child[]> {
    return fetch(`${import.meta.env.VITE_API_BASE_PATH}/children?house=${houseId}`, { mode: "same-origin" })
        .then(response => response.json())
}

export function getChildrenInformation(): Promise<PersonalInformationOfChild[]> {
    return fetch(`${import.meta.env.VITE_API_BASE_PATH}/children`, { mode: "same-origin" })
        .then(response => response.json())
}

export function getChildImageUrl({ id }: Child) {
    return `${import.meta.env.VITE_API_BASE_PATH}/children/${id}/img?${performance.now()}`
}

export function getAllPersonalInformation(): Promise<Record<string, PersonalInformation>> {
    return fetch(`${import.meta.env.VITE_API_BASE_PATH}/children/personalInformation`, { mode: "same-origin" })
        .then(response => response.json())
        .then(personalInformation =>
            personalInformation
                .reduce(
                    (map: Record<number, PersonalInformation>, pi: PersonalInformation) =>
                        ({ ...map, [pi.ci]: pi}),
                    {}
                )
        )
}

export function createChild(child: FormChild) {
    const formData = new FormData()

    formData.append("image", child.photo![0])
    formData.append("childForm", JSON.stringify({
        houseId: child.houseId,
        pInfo: child.information,
        mInfo: child.mother,
        fInfo: child.father,
        npInfo: child.nonParent,
        rBen: child.relBen.map(({ value }) => value) ?? [],
        attire: child.attire
    }))

    return fetch(`${import.meta.env.VITE_API_BASE_PATH}/children`, {
        method: "POST",
        body: formData,
        mode: "same-origin"
    })
}

export function isCiValidForChild(ci: number) {
    return fetch(`${import.meta.env.VITE_API_BASE_PATH}/children/unique?ci=${ci}`, { mode: "same-origin" })
        .then(response => response.ok)
}

function updateChildPersonalInformation(id: string, pi: PersonalInformation) {
    return fetch(`${import.meta.env.VITE_API_BASE_PATH}/children/${id}/information`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(pi),
        mode: "same-origin"
    }).then(response => response.ok)
}

function updateChildAttire(id: string, attire: Attire) {
    return fetch(`${import.meta.env.VITE_API_BASE_PATH}/children/${id}/attire`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(attire),
        mode: "same-origin"
    }).then(response => response.ok)
}

function updateChildParent<T extends "mother" | "father" | "representative">(id: string, parentCi: { [P in T]: string | undefined }) {
    const parentType = Object.keys(parentCi)[0] as T,
        ciValue = parentCi[parentType]
    return fetch(`${import.meta.env.VITE_API_BASE_PATH}/children/${id}/${parentType}${ciValue ? `?ci=${ciValue}` : ''}`, {
        method: "PATCH",
        mode: "same-origin"
    }).then(response => response.ok)
}

function updateChildPhoto(id: string, file: File) {
    return fetch(`${import.meta.env.VITE_API_BASE_PATH}/children/${id}/img`, {
        method: "PATCH",
        body: file,
        mode: "same-origin"
    }).then(response => response.ok)
}

function updateChildHouse(id: string, houseId: string) {
    return fetch(`${import.meta.env.VITE_API_BASE_PATH}/children/${id}/house`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: houseId
        }),
        mode: "same-origin"
    })
}

function addRelatedBeneficiary(id: string, relBenId: string) {
    return fetch(`${import.meta.env.VITE_API_BASE_PATH}/children/${id}/related`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: relBenId
        }),
        mode: "same-origin"
    })
}

function removeRelatedBeneficiary(id: string, relBenId: string) {
    return fetch(`${import.meta.env.VITE_API_BASE_PATH}/children/${id}/related`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: relBenId
        }),
        mode: "same-origin"
    })
}

export async function updateChild(childForm: FormChild, child: Child) {
    if (childForm.photo)
        await updateChildPhoto(child.id, childForm.photo[0])
    if (JSON.stringify(childForm.information) != JSON.stringify(child.information))
        await updateChildPersonalInformation(child.id, childForm.information)
    if (JSON.stringify(childForm.attire) != JSON.stringify(child.attire))
        await updateChildAttire(child.id, childForm.attire)
    if (childForm.mother?.ci != child.mother?.ci)
        await updateChildParent(child.id, { mother: childForm.mother?.ci })
    if (childForm.father?.ci != child.father?.ci)
        await updateChildParent(child.id, { father: childForm.father?.ci })
    if (childForm.nonParent?.ci != child.nonParent?.ci)
        await updateChildParent(child.id, { representative: childForm.nonParent?.ci })
    if (childForm.houseId != child.houseId)
        await updateChildHouse(child.id, childForm.houseId!)
    if (JSON.stringify(childForm.relBen) != JSON.stringify(child.relBen)) {
        const formRelatedBeneficiaries = new Set(childForm.relBen.map(({ value }) => value)),
            currentRelatedBeneficiaries = new Set(child.relBen),
            addedRelatedBeneficiaries = childForm.relBen.filter(({ value }) => !currentRelatedBeneficiaries.has(value)),
            removedRelatedBenficiaries = child.relBen.filter(rb => !formRelatedBeneficiaries.has(rb))

        await Promise.all(addedRelatedBeneficiaries.map(({ value }) => addRelatedBeneficiary(child.id, value)))
        await Promise.all(removedRelatedBenficiaries.map(id => removeRelatedBeneficiary(child.id, id)))
    }
}

export function deleteChild(id: string) {
    return fetch(`${import.meta.env.VITE_API_BASE_PATH}/children/${id}`, {
        method: "DELETE"
    })
}