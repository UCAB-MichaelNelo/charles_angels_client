type Phone = {
    value: string
}

type ScheduleEntry = {
    startTime: string,
    duration: string
}

type HouseForm = {
    houseName: string,
    houseRif: string
    houseAddress: string,
    houseImage: FileList,
    housePhones: Phone[]
    houseMaxShares: string,
    houseMinimumAge: string,
    houseMaximumAge: string
    // Contact Information
    houseContactCI: number,
    houseContactLastname: string
    houseContactName: string
    // Schedule Information
    mondaySchedule: ScheduleEntry[]
    tuesdaySchedule: ScheduleEntry[]
    wednesdaySchedule: ScheduleEntry[]
    thursdaySchedule: ScheduleEntry[]
    fridaySchedule: ScheduleEntry[]
}

function toSchedule(schedule: ScheduleEntry[]) {
      return schedule.map(({ startTime, duration }) => {
        const [startHour, startMinute, ..._] = startTime.split(":"),
              [durationHours, durationMinutes] = duration.includes(":") ? duration.split(":") : [duration, "0"]

        return {
            startHour: Number(startHour),
            startMinute: Number(startMinute),
            durationHours: Number(durationHours),
            durationMinutes: Number(durationMinutes)
        }
      })
}

export function createHouse(form: HouseForm) {
    const formData = new FormData(),
          file = form.houseImage[0],
          [ext, _] = file.name.split(".").reverse(),
          house = {
            fileExtension: ext,
            name: form.houseName,
            rif: form.houseRif,
            address: form.houseAddress,
            phones: form.housePhones.map(({ value }) => value),
            maxShares: form.houseMaxShares,
            minimumAge: form.houseMinimumAge,
            maximumAge: form.houseMaximumAge,
            currentShares: 0,
            currentGirlsHelped: 0,
            currentBoysHelped: 0
          },
          contact = {
           ci: form.houseContactCI,
           name: form.houseContactName,
           lastname: form.houseContactName
          },
          schedule = {
            monday: toSchedule(form.mondaySchedule),
            tuesday: toSchedule(form.tuesdaySchedule),
            wednesday: toSchedule(form.wednesdaySchedule),
            thursday: toSchedule(form.thursdaySchedule),
            friday: toSchedule(form.fridaySchedule)
          }

    return fetch(`http://localhost:3500/houses/image?ext=${ext}&rif=${form.houseRif}`, {
        method: "PUT",
        body: file
    }).then(() => fetch("http://localhost:3500/houses", {
        method: "POST",
        body: JSON.stringify({
            house,
            contact,
            schedule
        }),
        headers: {
            "Content-Type": "application/json"
        }
    }))
}

export function isRIFUnique(rif: number) {
    return fetch(`http://localhost:3500/houses/${rif}`)
    .then(response => response.ok)
}