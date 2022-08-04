import {AddOutlined} from "@mui/icons-material";
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia, Fade, FormControl,
    Grid, InputLabel, MenuItem,
    Paper, Select,
    Skeleton,
    TextField,
    Typography,
} from "@mui/material";
import React, {useEffect, useMemo, useState} from "react";
import {Link as RouterLink, useNavigate} from "react-router-dom";
import notFoundImage from "../../assets/not-found-image.jpeg";
import {useAppDispatch, useAppSelector} from "../../store";
import {House} from "../../types/houses";
import {getHouses} from "../../api/houses";
import {Child, HouseSelection} from "../../types/children";
import {deleteChild, getChildImageUrl, getChildren} from "../../api/children";
import {ChildModal} from "./ChildModal";
import {setChild} from "../../store/children";
import {selectIndexHouse, setIndexHouse} from "../../store/indexHouse";
import AddButton from "../shared/AddButton";

type ChildrenList = {
    children: Child[] | null;
};

type ChildGroups = [Child, Child, Child, Child][]

const itemsPerRow = 5

export default function PeopleIndex() {

    const firstFill = useMemo(() => new Array(itemsPerRow).fill(1), []),
        [list, setList] = useState<ChildrenList>({children: null}),
        [houseList, setHouseList] = useState<House[] | null>(null),
        indexHouse = useAppSelector(selectIndexHouse),
        [selectedHouse, setSelectedHouse] = useState<HouseSelection>(indexHouse ?? { id: "none" }),
        [filter, setFilter] = useState<string>(""),
        navigate = useNavigate(),
        dispatch = useAppDispatch(),
        [selectedChild, setSelectedChild] = useState<Child | null>(null),
        children: ChildGroups | undefined = useMemo(
            () =>
                list.children
                    ?.filter(
                        child => child.information.name.toLowerCase().includes(filter.toLowerCase()) ||
                            child.information.lastname.toLowerCase().includes(filter.toLowerCase())
                    )
                    .reduce((chunks: ChildGroups, _, index, arr: Child[]) => {
                        return (index % itemsPerRow == 0)
                            ? [arr.slice(index, index + itemsPerRow), ...chunks] as ChildGroups
                            : chunks;
                    }, []),
            [list, filter]
        ),
        editItem = (e: { stopPropagation: () => void}, child: Child) => {
            e.stopPropagation()

            dispatch(setChild(child))

            navigate('actualizar')
        },
        deleteItem = async (e: { stopPropagation: () => void}, child: Child) => {
            e.stopPropagation()

            await deleteChild(child.id)

            if (!list?.children) return

            if (selectedHouse) setSelectedHouse({ ...selectedHouse })
        }

    useEffect(() => {
        getHouses().then(houses => {
            setHouseList(houses)
        })
    }, [])

    useEffect(() => {
        if (!selectedHouse) return

        setList({ children: null })
        getChildren(selectedHouse.id).then(children => setList({ children }))

        dispatch(setIndexHouse(selectedHouse))
    }, [selectedHouse])

    console.log(indexHouse, selectedHouse)

    return (
        <>
            {selectedChild && (
                <ChildModal
                    child={selectedChild}
                    open={!!selectedChild}
                    onClose={() => setSelectedChild(null)}
                />)}
            <Box sx={{display: "flex", gap: 3}}>
                <FormControl sx={{ width: '25%'}}>
                    <InputLabel id="house-select">Seleccionar Casa...</InputLabel>
                    <Select labelId="house-select"
                            label="Seleccionar Casa..."
                            value={selectedHouse ? selectedHouse.id : "none"}
                            onChange={e => {
                                const houseId = e.target.value

                                if (houseId == "none")
                                    setSelectedHouse({ id: "none" })
                                else if (houseId != "none" && houseList)
                                    setSelectedHouse(houseList.find(house => house.id == houseId) ?? { id: "none"})
                            }}
                    >
                        {houseList && (<MenuItem value={"none"}>Sin Casa</MenuItem>)}
                        {houseList && houseList.map(house => (
                            <MenuItem key={house.id} value={house.id} >{house.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    fullWidth
                    variant="outlined"
                    label="Buscar niño/niña beneficiaria"
                    sx={{backgroundColor: "#eee"}}
                    onChange={e => setFilter(e.target.value)}
                ></TextField>
                <AddButton popoverText="Crear beneficiario" route="crear" />
            </Box>
            <Fade in={!!list.children}>
                <Box sx={{pt: 6}}>
                    <Grid container spacing={4}>
                        {!list.children &&
                            firstFill.map((_, index) => (
                                <React.Fragment key={index}>
                                    <Grid item key={`${index}-0`} xs={12 / itemsPerRow}>
                                        <Paper variant="outlined" sx={{px: 2, pt: 0, pb: 3}}>
                                            <Skeleton height={150}/>
                                            <Skeleton height={30}/>
                                        </Paper>
                                    </Grid>
                                    <Grid item key={`${index}-1`} xs={12 / itemsPerRow}>
                                        <Paper variant="outlined" sx={{px: 2, pt: 0, pb: 3}}>
                                            <Skeleton height={150}/>
                                            <Skeleton height={30}/>
                                        </Paper>
                                    </Grid>
                                    <Grid item key={`${index}-2`} xs={12 / itemsPerRow}>
                                        <Paper variant="outlined" sx={{px: 2, pt: 0, pb: 3}}>
                                            <Skeleton height={150}/>
                                            <Skeleton height={30}/>
                                        </Paper>
                                    </Grid>
                                    <Grid item key={`${index}-3`} xs={12 / itemsPerRow}>
                                        <Paper variant="outlined" sx={{px: 2, pt: 0, pb: 3}}>
                                            <Skeleton height={150}/>
                                            <Skeleton height={30}/>
                                        </Paper>
                                    </Grid>
                                </React.Fragment>
                            ))}
                        {children &&
                            children.map(
                                (childGroup: Child[], index: number) => (
                                    <React.Fragment key={index}>
                                        {childGroup.map((child) => (
                                            <Grid item xs={12 / itemsPerRow} key={child.id}
                                                onClick={() => setSelectedChild(child)}>
                                                {child && (
                                                    <Card variant="outlined" sx={{
                                                        height: '100%',
                                                        display: 'grid',
                                                        cursor: 'pointer',
                                                        '&:hover': {
                                                            boxShadow: '-2px 2px 20px rgba(0 0 0 / 15%), ' +
                                                                '2px -2px 20px rgba(0 0 0 / 15%), ' +
                                                                '2px 2px 20px rgba(0 0 0 /15%), ' +
                                                                '-2px -2px 20px rgba(0 0 0 / 15%)'
                                                        }
                                                    }}>
                                                        <CardMedia
                                                            component="img"
                                                            height={150}
                                                            image={getChildImageUrl(child)}
                                                            onError={(e: any) => {
                                                                e.preventDefault()
                                                                e.target.src = notFoundImage
                                                            }}
                                                        />
                                                        <CardContent>
                                                            <Typography
                                                                component="p"
                                                                sx={{fontWeight: 600}}
                                                                variant="subtitle1"
                                                                gutterBottom
                                                            >
                                                                {child.information.name} {child.information.lastname}
                                                            </Typography>
                                                            <Typography component="p" variant="subtitle2" fontWeight={400}>
                                                                CÉDULA: {child.information.ci}
                                                            </Typography>
                                                            <Typography component="p" variant="subtitle2" fontWeight={400}>
                                                                SEXO: {child.attire.sweaterSize ? "Masculino" : "Femenino"}
                                                            </Typography>
                                                            <Typography component="p" variant="subtitle2" fontWeight={400}>
                                                                NACIMIENTO: {child.information.birthdate}
                                                            </Typography>
                                                        </CardContent>
                                                        <CardActions sx={{mt: 'auto'}}>
                                                            <Button onClick={e => editItem(e, child)} variant="outlined">Editar</Button>
                                                            <Button onClick={e => deleteItem(e, child)} color="error" variant="outlined">
                                                                Eliminar
                                                            </Button>
                                                        </CardActions>
                                                    </Card>
                                                )}
                                            </Grid>
                                        ))}
                                    </React.Fragment>
                                )
                            )}
                    </Grid>
                </Box>
            </Fade>
        </>
    );
}
