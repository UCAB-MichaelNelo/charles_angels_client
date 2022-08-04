import {Controller, useFieldArray, useForm, FormProvider} from "react-hook-form";
import {FormChild, PersonalInformation, PersonalInformationOfChild} from "../../types/children";
import {
    Box, Button,
    Divider,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Switch,
    TextField
} from "@mui/material";
import React, {useEffect, useMemo, useRef, useState} from "react";
import {PersonalInformationForm} from "./PersonalInformationForm";
import {
    createChild,
    getAllPersonalInformation,
    getChildImageUrl,
    getChildrenInformation,
    updateChild
} from "../../api/children";
import {IncompleteHouse} from "../../types/houses";
import {getHousesAvailableForBeneficiaries} from "../../api/houses";
import {LoadingButton} from "@mui/lab";
import {useNavigate} from "react-router-dom";
import {AddOutlined, DeleteForeverOutlined} from "@mui/icons-material";
import {useAppSelector} from "../../store";
import {selectChild} from "../../store/children";

enum ChildGender {
    Boy,
    Girl
}

type Props = {
    isForUpdate: boolean
}

type AvailableRepresentatives = {
    mother: boolean
    father: boolean
}

export default function PeopleForm({ isForUpdate }: Props) {
    const child = useAppSelector(selectChild),
        navigate = useNavigate()

    if (isForUpdate && !child) {
        useEffect(() => {
            navigate("/personas")
        }, [])
        return null
    }

    const form = useForm<FormChild>({
            mode: 'all',
            defaultValues: (isForUpdate && child) ? {
                ...child,
                relBen: child.relBen.map(value => ({ value })),
                photo: null
            } : undefined
        }),
        {
            formState: {errors, isValid},
            register,
            unregister,
            control,
            handleSubmit,
            watch,
            setValue
        } = form,
        {
            fields: relatedBeneficiariesFields,
            append: appendRelatedBeneficiary,
            remove: removeRelatedBeneficiary
        } = useFieldArray({control, name: 'relBen'}),
        relatedBeneficiaries = watch("relBen"),
        photoField = register('photo', {required: !isForUpdate}),
        photoInput = useRef<HTMLInputElement | null>(null),
        photoRef = (e: HTMLInputElement | null) => {
            photoField.ref(e)
            photoInput.current = e
        },
        [availableRepresentatives, setAvailableRepresentatives] =
            useState<AvailableRepresentatives>(
                isForUpdate ?
                    {mother: !!child?.mother, father: !!child?.father} :
                    { mother: true, father: true }
            ),
        mustUseNonParentRepresentative = useMemo(() =>
                !availableRepresentatives.mother && !availableRepresentatives.father,
            [availableRepresentatives]),
        photo = watch('photo'),
        [childGender, setChildGender] = useState(isForUpdate ? child!.attire.sweaterSize ? ChildGender.Boy : ChildGender.Girl : ChildGender.Boy),
        photoUrl = useMemo(() => {
            const selectedPhoto = photo?.[0]
            return selectedPhoto ? URL.createObjectURL(selectedPhoto) : child && isForUpdate ? getChildImageUrl(child) : null
        }, [photo]),
        [personalInformation, setPersonalInformation] = useState<Record<string, PersonalInformation> | null>(null),
        [optionHouses, setOptionHouses] = useState<IncompleteHouse[] | null>(null),
        [childrenInformation, setChildrenInformation] = useState<PersonalInformationOfChild[] | null>(null),
        birthdate = watch("information.birthdate"),
        housesUnavailable = useMemo(() => !optionHouses || optionHouses.length == 0, [optionHouses]),
        [loading, setLoading] = useState<boolean>(false),
        onSubmit = (form: FormChild) => {
            setLoading(true)

            let promise: Promise<void>;

            if (!isForUpdate)
                promise = createChild(form)
                .then(response => response.ok)
                .then(isOk => {
                    if (isOk) navigate("/personas")
                    else window.alert("No se pudo crear a la persona")
                })
            else
                promise = updateChild(form, child!).then(() => navigate("/personas"))

            promise
                .catch(() => window.alert("Ocurrió un error al intentar crear a la persona, intente de nuevo más tarde"))
                .then(() => setLoading(false))
        }

    useEffect(() => {
        if (availableRepresentatives.mother || availableRepresentatives.father) {
            setValue('nonParent', null)
            unregister('nonParent')
        }

        if (!availableRepresentatives.mother) {
            setValue('mother', null)
            unregister('mother')
        }

        if (!availableRepresentatives.father) {
            setValue('father', null)
            unregister('father')
        }
    }, [availableRepresentatives])

    useEffect(() => {
        if (childGender == ChildGender.Boy) {
            setValue('attire.dressSize', null)
            unregister('attire.dressSize')
        } else {
            setValue('attire.sweaterSize', null)
            unregister('attire.sweaterSize')
        }
    }, [childGender])

    useEffect(() => {
        if (!!birthdate && birthdate != "")
            getHousesAvailableForBeneficiaries(birthdate)
                .then(houses => {
                    if (houses.length > 0)
                        setValue("houseId", houses[0].id, { shouldValidate: true })
                    return houses
                })
                .then(setOptionHouses)
    }, [birthdate])

    useEffect(() => {
        getAllPersonalInformation().then(setPersonalInformation)
    }, [])

    useEffect(() => {
        getChildrenInformation()
            .then(children => child ? children.filter(c => c.childId != child.id) : children)
            .then(setChildrenInformation)
    }, [])

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <FormProvider {...form}>
                <Grid container spacing={3}>
                    <Grid item xs={12}><Divider sx={{color: "rgba(0,0,0,0.4)"}}>INFORMACIÓN DEL BENEFICIARIO</Divider></Grid>
                    <Grid item xs={1}/>
                    <Grid item xs={10}>
                        <Box
                            onClick={() => photoInput.current?.click()}
                            sx={{
                                width: '100%',
                                paddingTop: '56.25%',
                                position: 'relative',
                                backgroundColor: photoUrl ? '' : '#545454',
                                cursor: 'pointer'
                            }}
                        >
                            {photoUrl && (<img alt={"Imagen del beneficiario"} src={photoUrl} style={{
                                width: '100%',
                                height: '100%',
                                cursor: 'pointer',
                                position: 'absolute',
                                inset: 0,
                            }}/>)}
                            {!photoUrl && (<div
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
                                }}>Subir imagen del beneficiario</h2>
                            </div>)}
                        </Box>
                        <label style={{display: 'none'}} htmlFor="house-image">
                            <input
                                accept="image/*"
                                type="file"
                                style={{display: "none"}}
                                {...photoField}
                                ref={photoRef}
                            />
                        </label>
                    </Grid>
                    <Grid item xs={1}/>
                    <Grid item xs={4}>
                        <FormControl fullWidth>
                            <InputLabel id="gender-label">Sexo</InputLabel>
                            <Select
                                defaultValue={childGender}
                                onChange={(e) => setChildGender(e.target.value as ChildGender)}
                                labelId="gender-label"
                                label="Sexo">
                                <MenuItem value={ChildGender.Boy}>Niño</MenuItem>
                                <MenuItem value={ChildGender.Girl}>Niña</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <PersonalInformationForm
                        isForUpdate={isForUpdate}
                        personalInformation={{}}
                        noAuto={true}
                        firstColumnWidth={8}
                        control={control}
                        fieldName={"information"}
                        validateCiUniqueness
                    />
                    <Grid item xs={6}>
                        <Controller
                            control={control}
                            name="attire.shortOrTrousersSize"
                            rules={{required: true, min : 1}}
                            defaultValue={0}
                            render={({field}) => {
                                return (
                                    <TextField
                                        fullWidth
                                        error={!!errors?.attire?.shortOrTrousersSize}
                                        variant="outlined"
                                        label="Talla de Short o Pantalones"
                                        type="number"
                                        helperText={
                                            errors?.attire?.shortOrTrousersSize?.type == "required"
                                                ? "La Talla de Short o Pantalones no puede estar vacía"
                                                : errors?.attire?.shortOrTrousersSize?.type == "min"
                                                    ? "La Talla de Short o Pantalones no puede ser menor que 1"
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
                            name="attire.tshirtOrshirtSize"
                            defaultValue={0}
                            rules={{required: true, min : 1}}
                            render={({field}) => {
                                return (
                                    <TextField
                                        fullWidth
                                        error={!!errors?.attire?.tshirtOrshirtSize}
                                        variant="outlined"
                                        label="Talla de Camisa o Camiseta"
                                        type="number"
                                        helperText={
                                            errors?.attire?.tshirtOrshirtSize?.type == "required"
                                                ? "La Talla de Camisa o Camiseta no puede estar vacía"
                                                : errors?.attire?.shortOrTrousersSize?.type == "min"
                                                    ? "La Talla de Camisa o Camiseta no puede ser menor que 1"
                                                    : ""
                                        }
                                        {...field}
                                    ></TextField>
                                );
                            }}
                        />
                    </Grid>
                    {(childGender == ChildGender.Boy) && (
                        <Grid item xs={6}>
                            <Controller
                                control={control}
                                name="attire.sweaterSize"
                                defaultValue={0}
                                rules={{required: true, min : 1}}
                                render={({field}) => {
                                    return (
                                        <TextField
                                            fullWidth
                                            error={!!errors?.attire?.sweaterSize}
                                            variant="outlined"
                                            label="Talla de Sueter"
                                            type="number"
                                            helperText={
                                                errors?.attire?.sweaterSize?.type == "required"
                                                    ? "La Talla de Sueter no puede estar vacía"
                                                    : errors?.attire?.sweaterSize?.type == "min"
                                                        ? "La Talla de Sueter no puede ser menor que 1"
                                                        : ""
                                            }
                                            {...field}
                                        ></TextField>
                                    );
                                }}
                            />
                        </Grid>
                    )}
                    {(childGender == ChildGender.Girl) && (
                        <Grid item xs={6}>
                            <Controller
                                control={control}
                                name="attire.dressSize"
                                defaultValue={0}
                                rules={{required: true, min : 1}}
                                render={({field}) => {
                                    return (
                                        <TextField
                                            fullWidth
                                            error={!!errors?.attire?.dressSize}
                                            variant="outlined"
                                            label="Talla de Vestido"
                                            type="number"
                                            helperText={
                                                errors?.attire?.dressSize?.type == "required"
                                                    ? "La Talla de Vestido no puede estar vacía"
                                                    : errors?.attire?.sweaterSize?.type == "min"
                                                        ? "La Talla de Vestido no puede ser menor que 1"
                                                        : ""
                                            }
                                            {...field}
                                        ></TextField>
                                    );
                                }}
                            />
                        </Grid>
                    )}
                    <Grid item xs={6}>
                        <Controller
                            control={control}
                            name="attire.footwearSize"
                            defaultValue={0}
                            rules={{required: true, min : 1}}
                            render={({field}) => {
                                return (
                                    <TextField
                                        fullWidth
                                        error={!!errors?.attire?.footwearSize}
                                        variant="outlined"
                                        label="Talla de Calzado"
                                        type="number"
                                        helperText={
                                            errors?.attire?.footwearSize?.type == "required"
                                                ? "La Talla de Calzado no puede estar vacía"
                                                : errors?.attire?.footwearSize?.type == "min"
                                                    ? "La Talla de Calzado no puede ser menor que 1"
                                                    : ""
                                        }
                                        {...field}
                                    ></TextField>
                                );
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Controller
                            control={control}
                            name="houseId"
                            rules={{ required: true }}
                            render={({ field }) => (
                                <FormControl fullWidth>
                                    <InputLabel id="house-label">Casa hogar a la que pertenece</InputLabel>
                                    <Select
                                        labelId="house-label"
                                        label="Casa hogar a la que pertenece"
                                        disabled={housesUnavailable}
                                        {...field}
                                        value={housesUnavailable ? "unavailable" : field.value}>
                                        {!housesUnavailable &&
                                            (optionHouses!.map(({id, name, rif}) => (
                                                <MenuItem key={id} value={id}>{name} (J-{rif})</MenuItem>
                                            )))}
                                    </Select>
                                </FormControl>
                            )} />
                    </Grid>
                    <Grid item xs={12}>
                        <Divider sx={{color: "rgba(0,0,0,0.4)"}}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        onChange={(evt) =>
                                            setAvailableRepresentatives({
                                                ...availableRepresentatives,
                                                mother: evt.target.checked
                                            })
                                        }
                                        checked={availableRepresentatives.mother} />
                                }
                                label="MADRE" />
                        </Divider>
                    </Grid>
                    {availableRepresentatives.mother && (<PersonalInformationForm isForUpdate={isForUpdate} personalInformation={personalInformation} control={control} fieldName={"mother"} />)}
                    <Grid item xs={12}>
                        <Divider sx={{color: "rgba(0,0,0,0.4)"}}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        onChange={(evt) =>
                                            setAvailableRepresentatives({
                                                ...availableRepresentatives,
                                                father: evt.target.checked
                                            })
                                        }
                                        checked={availableRepresentatives.father} />}
                                label="PADRE" />
                        </Divider>
                    </Grid>
                    {availableRepresentatives.father && (<PersonalInformationForm isForUpdate={isForUpdate} personalInformation={personalInformation} control={control} fieldName={"father"}/>)}
                    <Grid item xs={12}>
                        <Divider sx={{color: "rgba(0,0,0,0.4)"}}>
                            <FormControlLabel
                                control={<Switch checked={mustUseNonParentRepresentative} />}
                                label="TUTOR" />
                        </Divider>
                    </Grid>
                    {mustUseNonParentRepresentative && (<PersonalInformationForm isForUpdate={isForUpdate} personalInformation={personalInformation} control={control} fieldName={"nonParent"}/>)}
                    <Grid item xs={12}><Divider sx={{color: "rgba(0,0,0,0.4)"}}>BENEFICIARIOS RELACIONADOS</Divider></Grid>
                    {childrenInformation && relatedBeneficiariesFields.map((relBen, index) => {
                        const currentSelectedChild = childrenInformation.find(({childId}) => childId == relatedBeneficiaries[index].value),
                            validInformation = currentSelectedChild ? [
                                currentSelectedChild,
                                ...childrenInformation.filter(({ childId }) => !relatedBeneficiaries.find(inf => inf.value == childId))
                            ] : childrenInformation.filter(({ childId }) => !relatedBeneficiaries.find(inf => inf.value == childId))
                        return (<React.Fragment key={index}>
                            <Grid item xs={11}>
                                <FormControl fullWidth>
                                    <InputLabel id={`rel-ben-${index}`}>Seleccionar beneficiario relacionado</InputLabel>
                                    <Controller
                                        control={control}
                                        defaultValue={validInformation[0].childId}
                                        name={`relBen.${index}.value`}
                                        rules={{required: true}}
                                        render={({ field }) =>
                                            <Select
                                                labelId={`rel-ben-${index}`}
                                                label={"Seleccionar beneficiario relacionado"}
                                                {...field}
                                            >
                                                {validInformation.map(inf => (
                                                    <MenuItem key={inf.childId}
                                                              value={inf.childId}>{inf.information.name} {inf.information.lastname}</MenuItem>
                                                ))}
                                            </Select>
                                            }
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={1}>
                                <Button
                                    variant="contained"
                                    color="error"
                                    sx={{py: 1.4, mr: "auto"}}
                                    onClick={() => removeRelatedBeneficiary(index)}
                                >
                                    <DeleteForeverOutlined fontSize="large"/>
                                </Button>
                            </Grid>
                        </React.Fragment>)
                    })}
                    {childrenInformation && (relatedBeneficiaries.length < childrenInformation.length) &&
                        (<Grid item xs={12}>
                            <Button
                                fullWidth
                                color="secondary"
                                onClick={() => appendRelatedBeneficiary({value: ""})}
                            >
                                <AddOutlined fontSize="large"/>
                            </Button>
                        </Grid>)}
                </Grid>
                <LoadingButton
                    disabled={!isValid || Object.keys(errors).length > 0 }
                    loading={loading}
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{mt: 4}}
                >
                    Guardar Beneficiario
                </LoadingButton>
            </FormProvider>
        </form>
    )
}