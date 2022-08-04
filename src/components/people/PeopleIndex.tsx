import {AddOutlined} from "@mui/icons-material";
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Grid,
    Paper,
    Skeleton,
    TextField,
    Typography,
} from "@mui/material";
import React, {useEffect, useMemo, useState} from "react";
import {Link as RouterLink, useNavigate} from "react-router-dom";
import notFoundImage from "../../assets/not-found-image.jpeg";
import {HouseModal} from "./HouseModal";
import {useAppDispatch} from "../../store";
import {setHouse} from "../../store/house";
import {House} from "../../types/houses";
import {deleteHouse, getHouseImageUrl, getHouses} from "../../api/houses";

type HousesList = {
    houses: House[] | null;
};

type HouseGroups = [House, House, House, House][]

const itemsPerRow = 5

export default function HousesIndex() {
    const firstFill = useMemo(() => new Array(itemsPerRow).fill(1), []),
        [list, setList] = useState<HousesList>({houses: null}),
        [filter, setFilter] = useState<string>(""),
        [selectedHouse, setSelectedHouse] = useState<House | null>(null),
        dispatch = useAppDispatch(),
        navigate = useNavigate(),
        houses: HouseGroups | undefined = useMemo(
            () =>
                list.houses
                    ?.filter(house => house.name.toLowerCase().includes(filter.toLowerCase()))
                    .reduce((chunks: HouseGroups, _, index, arr: House[]) => {
                        return (index % itemsPerRow == 0)
                            ? [arr.slice(index, index + itemsPerRow), ...chunks] as HouseGroups
                            : chunks;
                    }, []),
            [list, filter]
        ),
        editItem = (e: { stopPropagation: () => void}, house: House) => {
            e.stopPropagation()

            dispatch(setHouse(house))
            navigate('/casas/actualizar')
        },
        deleteItem = async (e: { stopPropagation: () => void}, house: House) => {
            e.stopPropagation()

            if (!list?.houses) return

            const idx = list?.houses?.indexOf(house)

            await deleteHouse(house)

            if (idx != -1) {
                const [preList, postList] = [list.houses.slice(0, idx), list.houses.slice(idx + 1)]
                setList({ houses: preList.concat(postList) })
            }
        }

    useEffect(() => {
        getHouses()
            .then((list) => setList({houses: list}));
    }, []);

    return (
        <>
            <Box sx={{display: "flex", gap: 3}}>
                <TextField
                    fullWidth
                    variant="outlined"
                    label="Buscar casa hogar"
                    sx={{backgroundColor: "#eee"}}
                    onChange={e => setFilter(e.target.value)}
                ></TextField>
                <Button variant="contained" component={RouterLink} to="crear">
                    <AddOutlined fontSize="large"/>
                </Button>
            </Box>
            <HouseModal house={selectedHouse!} open={!!selectedHouse} onClose={() => setSelectedHouse(null)} />
            <Box sx={{pt: 6}}>
                <Grid container spacing={4}>
                    {!list.houses &&
                        firstFill.map((_, index) => (
                            <React.Fragment key={index}>
                                <Grid item xs={12 / itemsPerRow}>
                                    <Paper variant="outlined" sx={{px: 2, pt: 0, pb: 3}}>
                                        <Skeleton height={150}/>
                                        <Skeleton height={30}/>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12 / itemsPerRow}>
                                    <Paper variant="outlined" sx={{px: 2, pt: 0, pb: 3}}>
                                        <Skeleton height={150}/>
                                        <Skeleton height={30}/>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12 / itemsPerRow}>
                                    <Paper variant="outlined" sx={{px: 2, pt: 0, pb: 3}}>
                                        <Skeleton height={150}/>
                                        <Skeleton height={30}/>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12 / itemsPerRow}>
                                    <Paper variant="outlined" sx={{px: 2, pt: 0, pb: 3}}>
                                        <Skeleton height={150}/>
                                        <Skeleton height={30}/>
                                    </Paper>
                                </Grid>
                            </React.Fragment>
                        ))}
                    {houses &&
                        houses.map(
                            (houseGroup: House[], index: number) => (
                                <React.Fragment key={index}>
                                    {houseGroup.map((house) => (
                                        <Grid item xs={12 / itemsPerRow} key={house.id}
                                              onClick={() => setSelectedHouse(house)}>
                                            {house && (
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
                                                        image={getHouseImageUrl(house)}
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
                                                        >
                                                            {house.name}
                                                        </Typography>
                                                        <Typography component="p" variant="subtitle2" gutterBottom>
                                                            RIF: {house.rif}
                                                        </Typography>
                                                        <Typography component="p" variant="body1">
                                                            {house.address}
                                                        </Typography>
                                                    </CardContent>
                                                    <CardActions sx={{mt: 'auto'}}>
                                                        <Button onClick={e => editItem(e, house)} variant="outlined">Editar</Button>
                                                        <Button onClick={e => deleteItem(e, house)} color="error" variant="outlined">
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
        </>
    );
}
