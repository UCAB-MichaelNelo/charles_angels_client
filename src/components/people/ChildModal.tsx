import {Fade, Modal, Box, Typography, Grid} from "@mui/material";
import notFoundImage from "../../assets/not-found-image.jpeg";
import {House} from "../../types/houses";
import {useState} from "react";
import {getHouseImageUrl} from "../../api/houses";

type Props = {
    house: House,
    open: boolean,
    onClose: () => void
}

export function HouseModal({ house, open, onClose }: Props) {
    if (!house) return <></>
    const [url, setUrl] = useState(getHouseImageUrl(house))
    return (
        <Modal
            open={open}
            onClose={onClose}
            closeAfterTransition
            keepMounted
        >
            <Fade in={open}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'background.paper',
                    width: 560,
                    maxHeight: '97.5%',
                    border: '1px solid black',
                    borderRadius: 1,
                    overflow: 'auto'
                }}>
                    <Box sx={{
                        width: '100%',
                        paddingTop: '56.25%',
                        position: 'relative',
                    }}>
                        <img src={url} style={{
                            width: '100%',
                            height: '100%',
                            cursor: 'pointer',
                            position: 'absolute',
                            inset: 0,
                        }} onError={e => {
                          e.preventDefault()
                            setUrl(notFoundImage)
                        }}/>
                    </Box>
                    <Box sx={{
                        userSelect: 'none',
                        p: 4
                    }}>
                       <Grid container spacing={4}>
                            <Grid item xs={6}>
                                <Typography variant={"subtitle2"}>RIF DE LA CASA</Typography>
                                <Typography variant={"body1"}>J-{house.rif}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant={"subtitle2"}>NOMBRE DE LA CASA</Typography>
                                <Typography variant={"body1"}>{house.name}</Typography>
                            </Grid>
                           <Grid item xs={12}>
                               <Typography variant={"subtitle2"}>PERSONA CONTACTO</Typography>
                               <Typography variant={"body1"}>{house.contact.name} {house.contact.lastname}</Typography>
                           </Grid>
                            <Grid item xs={12}>
                                <Typography variant={"subtitle2"}>DIRECCION DE LA CASA</Typography>
                                <Typography variant={"body1"}>{house.address}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant={"subtitle2"}>NUMEROS DE TELEFONO DE CONTACTO</Typography>
                                {house.phones.map(phone => (
                                    <Typography variant={"body1"} key={phone}>{phone}</Typography>
                                ))}
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant={"subtitle2"}>EDAD MINIMA</Typography>
                                <Typography variant={"body1"}>{house.minimumAge}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant={"subtitle2"}>EDAD MAXIMA</Typography>
                                <Typography variant={"body1"}>{house.maximumAge}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant={"subtitle2"}>CUPOS MAXIMOS</Typography>
                                <Typography variant={"body1"}>{house.maxShares}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant={"subtitle2"}>CUPOS OCUPADOS</Typography>
                                <Typography variant={"body1"}>{house.currentShares}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant={"subtitle2"}>NIÑOS ATENDIDOS</Typography>
                                <Typography variant={"body1"}>{house.currentBoysHelped}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant={"subtitle2"}>NIÑAS ATENDIDAS</Typography>
                                <Typography variant={"body1"}>{house.currentGirlsHelped}</Typography>
                            </Grid>
                           <Grid item xs={12}>
                               <Typography variant={"subtitle2"}>HORARIO DE ATENCION</Typography>
                               <Typography variant={"body1"}>{house.scheduleStartTime} - {house.scheduleEndTime}</Typography>
                           </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Fade>
        </Modal>
    )
}