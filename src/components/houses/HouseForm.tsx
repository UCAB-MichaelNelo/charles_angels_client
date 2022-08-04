import {AddOutlined, DeleteForeverOutlined,} from "@mui/icons-material";
import {LoadingButton} from "@mui/lab";
import {
    Autocomplete,
    Box,
    Button,
    CircularProgress,
    Divider, FormControl,
    Grid,
    InputAdornment, InputLabel, MenuItem,
    Select,
    TextField,
} from "@mui/material";
import React, {useMemo, useRef, useState} from "react";
import {Controller, useFieldArray, useForm,} from "react-hook-form";
import {useMatch, useNavigate} from "react-router-dom";
import {createHouse, getAllAvailableCis, getHouseImageUrl, isRIFUnique, updateHouse} from "../../api/houses";
import {useAppSelector} from "../../store";
import {selectHouse} from "../../store/house";
import {Contact} from "../../types/houses";

export default function HouseForm() {
    const house = useAppSelector(selectHouse),
        match = useMatch("/casas/:slug"),
        isUpdateForm = useMemo(() => match?.params["slug"] == "actualizar", [match?.params["slug"]]),
        defaultValues = isUpdateForm && house ? ({
            houseRif: house.rif,
            houseName: house.name,
            houseAddress: house.address,
            housePhones: house.phones.map(value => ({ value })),
            houseMaxShares: house.maxShares,
            houseMaximumAge: house.maximumAge,
            houseMinimumAge: house.minimumAge,
            houseCurrentShares: house.currentShares,
            houseScheduleStartTime: house.scheduleStartTime,
            houseScheduleEndTime: house.scheduleEndTime,
            houseContactCI: house.contact.ci.toString(),
            houseContactName: house.contact.name,
            houseContactLastname: house.contact.lastname
        }) : { housePhones: [{value: ""}] },
        form = useForm<any>({
            mode: "all",
            defaultValues
        }),
        {
            control,
            formState: {errors, isValid},
            watch,
            setError,
            register,
            clearErrors,
            resetField,
            handleSubmit,
            setValue
        } = form,
        {
            fields: phoneFields,
            append: appendPhone,
            remove: phoneRemove,
        } = useFieldArray({
            control,
            name: "housePhones",
        }),
        minAge = watch("houseMinimumAge"),
        maxAge = watch("houseMaximumAge"),
        scheduleStartTime = watch("houseScheduleStartTime"),
        scheduleEndTime = watch("houseScheduleEndTime"),
        [loading, setLoading] = useState(false),
        [confirmingRif, setConfirmingRif] = useState(false),
        fileField = register("houseImage", {required: !isUpdateForm}),
        [url, setUrl] = useState<string | null>(isUpdateForm && house ? getHouseImageUrl(house) : null),
        fileInput = useRef<{ el: HTMLInputElement | null }>({el: null}),
        fileRef = (el: HTMLInputElement | null) => {
            fileField.ref(el);
            fileInput.current.el = el;
            el?.addEventListener('change', (e) => {
                const file = el?.files?.[0]
                if (file) {
                    const url = URL.createObjectURL(file)
                    setUrl(url)
                }
            })
        },
        navigate = useNavigate(),
        onSubmit = (form: any) => {
            setLoading(true);

            if (isUpdateForm && house)
                updateHouse(form, house)
                    .then(([ok, field]: [boolean, string]) => {
                        setLoading(false)

                        if (!ok)
                            window.alert(`Un error ha ocurrido en la actualización del campo ${field}. Por favor intente más tarde`)
                        else
                            navigate("/casas")
                    })
                    .catch(() => {
                        setLoading(false)
                        window.alert(`Un error ha ocurrido en la actualización de la casa. Por favor intente más tarde`)
                    })
            else if (!isUpdateForm)
                createHouse(form)
                    .then(async (response: Response | undefined) => {
                        setLoading(false)

                        if (!response) return

                        if (response.ok) navigate("/casas")
                        else
                            window.alert("Un error ha ocurrido al procesar el formulario, por favor intente mas tarde.")
                    })
                    .catch(() => {
                        setLoading(false)
                        window.alert("Un error ha ocurrido al procesar el formulario, por favor intente mas tarde.")
                    })
        },
        rif = watch("houseRif"),
        houseContactCI = watch("houseContactCI"),
        [availableContacts, setAvailableContacts] = useState<Record<number, Contact> | null>(null),
        [selectedContact, setSelectedContact] = useState<Contact | null>(null);

    React.useEffect(() => {
        if (
            Number(minAge) > Number(maxAge) &&
            errors.houseMaximumAge?.type != "coherent"
        ) {
            setError("houseMaximumAge", {type: "coherent"});
        } else if (Number(minAge) < Number(maxAge)) {
            clearErrors("houseMaximumAge");
        }
    }, [minAge, maxAge]);

    React.useEffect(() => {
        if (!scheduleStartTime && !scheduleEndTime) return

        const [rstartHour, rstartMinute] = scheduleStartTime.split(':'),
            [rendHour, rendMinute] = scheduleEndTime.split(':'),
            startHour = Number(rstartHour), startMinute = Number(rstartMinute),
            endHour = Number(rendHour), endMinute = Number(rendMinute)


        if (startHour > endHour || (startHour == endHour && startMinute > startMinute))
            setError("houseScheduleEndTime", {type: 'coherent'})
        else if (endHour < startHour || (startHour == endHour && endMinute < startMinute))
            setError("houseScheduleStartTime", {type: 'coherent'})
        else if (endHour == startHour && startMinute == endMinute) {
            setError('houseScheduleEndTime', {type: 'coherent'})
            setError('houseScheduleStartTime', {type: 'coherent'})
        } else {
            if (errors.houseScheduleStarTime?.type == "coherent") clearErrors("houseScheduleStartTime")
            if (errors.houseScheduleEndTime?.type == "coherent") clearErrors("houseScheduleEndTime")
        }
    }, [scheduleStartTime, scheduleEndTime])

    React.useEffect(() => {
        if (house && house.rif == rif) return
        if (rif && rif.length == 9) {
            setConfirmingRif(true);
            isRIFUnique(rif).then((isUnique) => {
                if (!isUnique) setError("houseRif", {type: "unicity"});
                setConfirmingRif(false);
            });
        }
    }, [rif]);

    React.useEffect(() => {
        getAllAvailableCis().then(setAvailableContacts)
    }, [])

    React.useEffect(() => {
        const contact = availableContacts?.[Number(houseContactCI)]

        if (contact) {
            setValue("houseContactName", contact.name)
            setValue("houseContactLastname", contact.lastname)
            setSelectedContact(contact)
        } else {
            resetField("houseContactName")
            resetField("houseContactLastname")

            setSelectedContact(null)
        }

    }, [houseContactCI, availableContacts])

    React.useEffect(() => {
        if (!house && isUpdateForm) navigate("/casas")
    }, [house, isUpdateForm])

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Divider sx={{color: "rgba(0,0,0,0.4)"}}>INFOMRACIÓN DE LA CASA</Divider>
                </Grid>
                <Grid item xs={1}/>
                <Grid item xs={10}>
                    <Box
                        onClick={() => fileInput.current?.el?.click()}
                        sx={{
                            width: '100%',
                            paddingTop: '56.25%',
                            position: 'relative',
                            backgroundColor: url ? '' : '#545454',
                            cursor: 'pointer'
                        }}
                    >
                        {url && (<img alt={"Imagen de casa hogar"} src={url} style={{
                            width: '100%',
                            height: '100%',
                            cursor: 'pointer',
                            position: 'absolute',
                            inset: 0,
                        }}/>)}
                        {!url && (<div
                            style={{
                                margin: 'auto',
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                            }}
                        >
                            <h2 style={{
                                margin: 'auto',
                                color: 'white'
                            }}>Subir imagen de la casa hogar</h2>
                        </div>)}
                    </Box>
                    <label style={{display: 'none'}} htmlFor="house-image">
                        <input
                            accept="image/*"
                            type="file"
                            style={{display: "none"}}
                            {...fileField}
                            ref={fileRef}
                        />
                    </label>
                </Grid>
                <Grid item xs={1}/>
                <Grid item xs={6}>
                    <Controller
                        control={control}
                        name="houseName"
                        rules={{required: true, maxLength: 50}}
                        defaultValue=""
                        render={({field}) => {
                            return (
                                <TextField
                                    fullWidth
                                    error={!!errors.houseName}
                                    variant="outlined"
                                    label="Nombre de la Casa"
                                    helperText={
                                        errors.houseName?.type == "required"
                                            ? "El nombre no puede estar vacio"
                                            : errors.houseName?.type == "maxLength"
                                                ? "El nombre no puede tener mas de 50 caracteres"
                                                : ""
                                    }
                                    {...field}
                                ></TextField>
                            );
                        }}
                    />
                </Grid>
                <Grid item xs={6}>
                    <Controller
                        control={control}
                        name="houseRif"
                        rules={{
                            required: true,
                            maxLength: 9,
                            minLength: 9,
                            pattern: /[123456789]+/,
                        }}
                        defaultValue=""
                        render={({field}) => (
                            <TextField
                                fullWidth
                                disabled={confirmingRif}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">J-</InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            {confirmingRif && <CircularProgress size="1.5em"/>}
                                        </InputAdornment>
                                    ),
                                }}
                                variant="outlined"
                                label="RIF de la Casa"
                                error={!!errors.houseRif}
                                helperText={
                                    errors.houseRif?.type == "required"
                                        ? "El RIF no puede estart vacio"
                                        : errors.houseRif?.type == "pattern"
                                            ? "El RIF solo puede tener digitos"
                                            : errors.houseRif?.type == "maxLength" ||
                                            errors.houseRif?.type == "minLength"
                                                ? "El RIF solo puede tener 9 numeros"
                                                : errors.houseRif?.type == "unicity"
                                                    ? "El RIF no es unico"
                                                    : ""
                                }
                                {...field}
                            ></TextField>
                        )}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Controller
                        control={control}
                        defaultValue=""
                        name="houseAddress"
                        rules={{required: true, maxLength: 255}}
                        render={({field}) => (
                            <TextField
                                fullWidth
                                multiline
                                label="Dirección de la Casa"
                                rows={8}
                                placeholder="El Paraiso, Avenida Libertador..."
                                error={!!errors.houseAddress}
                                helperText={
                                    errors.houseAddress?.type == "maxLength"
                                        ? "La dirección no puede tener mas de 255 caracteres"
                                        : errors.houseAddress?.type == "required"
                                            ? "La dirección no puede estar vacía"
                                            : ""
                                }
                                {...field}
                            ></TextField>
                        )}
                    />
                </Grid>
                <Grid item xs={4}>
                    <Controller
                        control={control}
                        name="houseMaxShares"
                        rules={{required: true, min:
                                isUpdateForm && house && house.currentShares > 0?
                                    house.currentShares : 1}}
                        defaultValue={1}
                        render={({field}) => (
                            <TextField
                                fullWidth
                                variant="outlined"
                                type="number"
                                label="Cupos Máximos"
                                error={!!errors.houseMaxShares}
                                helperText={
                                    errors.houseMaxShares?.type == "required"
                                        ? "Los cupos máximos no pueden estar vacíos"
                                        : errors.houseMaxShares?.type == "min"
                                            ? "Los cupos máximos no pueden ser menores que 1"
                                            : ""
                                }
                                {...field}
                            ></TextField>
                        )}
                    />
                </Grid>
                <Grid item xs={4}>
                    <Controller
                        control={control}
                        name="houseMinimumAge"
                        rules={{required: true, min: 0}}
                        defaultValue={0}
                        render={({field}) => (
                            <TextField
                                fullWidth
                                variant="outlined"
                                type="number"
                                label="Edad mínima para la entrada en la Casa"
                                error={!!errors.houseMinimumAge}
                                helperText={
                                    errors.houseMinimumAge?.type == "required"
                                        ? "La edad minima no puede estar vacía"
                                        : errors.houseMinimumAge?.type == "min"
                                            ? "La edad minima no puede ser menor que 0"
                                            : ""
                                }
                                {...field}
                            ></TextField>
                        )}
                    />
                </Grid>
                <Grid item xs={4}>
                    <Controller
                        control={control}
                        name="houseMaximumAge"
                        rules={{required: true, min: 1}}
                        defaultValue={1}
                        render={({field}) => (
                            <TextField
                                fullWidth
                                variant="outlined"
                                type="number"
                                label="Edad máxima para la estadía en la Casa"
                                error={!!errors.houseMaximumAge}
                                helperText={
                                    errors.houseMaximumAge?.type == "required"
                                        ? "La edad maxima no puede estar vacía"
                                        : errors.houseMaximumAge?.type == "min"
                                            ? "La edad maxima no puede ser menor que 1"
                                            : errors.houseMaximumAge?.type == "coherent"
                                                ? "La edad maxima no puede ser menor que la edad mínima"
                                                : ""
                                }
                                {...field}
                            ></TextField>
                        )}
                    />
                </Grid>
                <Grid item xs={6}>
                    <Controller
                        control={control}
                        name="houseScheduleStartTime"
                        defaultValue={"00:00"}
                        render={({field}) => (
                            <TextField
                                fullWidth
                                variant="outlined"
                                type="time"
                                label="Tiempo de inicio del horario de atención"
                                error={!!errors.houseScheduleStartTime}
                                helperText={
                                    errors.houseScheduleStartTime?.type == "coherent"
                                        ? "El tiempo de inicio no puede ser posterior o igual al tiempo de fin"
                                        : ""
                                }
                                {...field}
                            ></TextField>
                        )}
                    />
                </Grid>
                <Grid item xs={6}>
                    <Controller
                        control={control}
                        name="houseScheduleEndTime"
                        defaultValue={"23:59"}
                        render={({field}) => (
                            <TextField
                                fullWidth
                                variant="outlined"
                                type="time"
                                label="Tiempo de finalización del horario de atención"
                                error={!!errors.houseScheduleEndTime}
                                helperText={
                                    errors.houseScheduleEndTime?.type == "coherent"
                                        ? "El tiempo de finalización no puede ser anterior o igual al de inicio"
                                        : ""
                                }
                                {...field}
                            ></TextField>
                        )}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Divider sx={{color: "rgba(0,0,0,0.4)"}}>CONTACTO</Divider>
                </Grid>
                <Grid item xs={12}>
                    <Controller
                        control={control}
                        name="houseContactCI"
                        rules={{required: true, maxLength: 9}}
                        defaultValue=""
                        render={({field: {onChange, ...props}}) =>
                            <Autocomplete
                                freeSolo={!isUpdateForm}
                                disableClearable
                                options={
                                    availableContacts ?
                                        Object.keys(availableContacts).map(ci => ci.toString()) :
                                        [] as string[]
                                }
                                renderOption={(props, ci) => {
                                    const nci = Number(ci),
                                        contact = availableContacts?.[nci]
                                    return (
                                        <span {...props}>
                                            {`${contact?.name} ${contact?.lastname} (${ci})`}
                                        </span>
                                    )
                                }}
                                defaultValue={props.value}
                                loading={!availableContacts}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        variant="outlined"
                                        type="number"
                                        label="Cédula de Identidad"
                                        error={!!errors.houseContactCI}
                                        helperText={
                                            errors.houseContactCI?.type == "required"
                                                ? "La cédula no puede estar vacía"
                                                : errors.houseContactCI?.type == "maxLength"
                                                    ? "La cédula no puede tener más de 9 dígitos"
                                                    : ""
                                        }
                                        InputProps={{
                                            ...params.InputProps,
                                            type: 'number',
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    {!availableContacts && <CircularProgress size="1.5em"/>}
                                                </InputAdornment>
                                            )
                                        }}></TextField>
                                )}
                                onChange={isUpdateForm ? (_, data) => onChange(data) : undefined}
                                onInputChange={isUpdateForm ? undefined : (_, data) => onChange(data)}
                                {...props}
                            />
                        }
                    />
                </Grid>
                <Grid item xs={6}>
                    <Controller
                        control={control}
                        name="houseContactName"
                        defaultValue=""
                        rules={{required: true, maxLength: 50}}
                        render={({field}) => (
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Nombre"
                                InputProps={{
                                    readOnly: !!selectedContact
                                }}
                                error={!!errors.houseContactName}
                                helperText={
                                    errors.houseContactName?.type == "required"
                                        ? "El nombre no puede estar vacío"
                                        : errors.houseContactName?.type == "maxLength"
                                            ? "El nombre no puede tener más de 50 dígitos"
                                            : ""
                                }
                                {...field}
                            ></TextField>
                        )}
                    />
                </Grid>
                <Grid item xs={6}>
                    <Controller
                        control={control}
                        name="houseContactLastname"
                        defaultValue=""
                        rules={{required: true, maxLength: 50}}
                        render={({field}) => (
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Apellido"
                                InputProps={{
                                    readOnly: !!selectedContact
                                }}
                                error={!!errors.houseContactLastname}
                                helperText={
                                    errors.houseContactLastname?.type == "required"
                                        ? "El apellido no puede estar vacío"
                                        : errors.houseContactLastname?.type == "maxLength"
                                            ? "El apellido no puede tener más de 50 dígitos"
                                            : ""
                                }
                                {...field}
                            ></TextField>
                        )}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Divider sx={{color: "rgba(0,0,0,0.4)"}}>TELÉFONOS</Divider>
                </Grid>
                {phoneFields.map((phone, index) => (
                    <React.Fragment key={phone.id}>
                        <Grid item xs={index == 0 ? 12 : 11}>
                            <Controller
                                control={control}
                                defaultValue=""
                                name={`housePhones.${index}.value`}
                                rules={{
                                    required: true,
                                    pattern: /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/,
                                }}
                                render={({field}) => (
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        label="Teléfono"
                                        error={!!errors.housePhones?.[index]?.value}
                                        helperText={
                                            errors.housePhones?.[index]?.value?.type == "pattern"
                                                ? "El teléfono debe tener el formato 000-000-0000"
                                                : ""
                                        }
                                        {...field}
                                    ></TextField>
                                )}
                            />
                        </Grid>
                        {index != 0 && (
                            <Grid item xs={1}>
                                <Button
                                    variant="contained"
                                    color="error"
                                    sx={{py: 1.4, mr: "auto"}}
                                    onClick={() => phoneRemove(index)}
                                >
                                    <DeleteForeverOutlined fontSize="large"/>
                                </Button>
                            </Grid>
                        )}
                    </React.Fragment>
                ))}
                <Grid item xs={12}>
                    <Button
                        fullWidth
                        color="secondary"
                        onClick={() => appendPhone({value: ""})}
                    >
                        <AddOutlined fontSize="large"/>
                    </Button>
                </Grid>
            </Grid>
            <LoadingButton
                disabled={!isValid || Object.keys(errors).length > 0 || confirmingRif}
                loading={loading}
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{mt: 4}}
            >
                Guardar Casa
            </LoadingButton>
        </form>
    );
}
