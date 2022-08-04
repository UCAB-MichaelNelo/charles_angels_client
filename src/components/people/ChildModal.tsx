import {Fade, Modal, Box, Typography, Grid} from "@mui/material";
import notFoundImage from "../../assets/not-found-image.jpeg";
import {House} from "../../types/houses";
import {useEffect, useState} from "react";
import {getHouseImageUrl} from "../../api/houses";
import {Child} from "../../types/children";
import {getChild, getChildImageUrl} from "../../api/children";

type Props = {
    child: Child,
    open: boolean,
    onClose: () => void
}

export function ChildModal({ child, open, onClose }: Props) {
    if (!child) return null

    const [url, setUrl] = useState(getChildImageUrl(child)),
        [relatedBeneficiaries, setRelatedBeneficiaries] = useState<Child[] | null>(null)

    useEffect(() => {
        Promise.all(child.relBen.map(getChild)).then(setRelatedBeneficiaries)
    }, [])

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
                                <Typography variant={"subtitle2"}>CEDULA DE IDENTIDAD</Typography>
                                <Typography variant={"body1"}>{child.information.ci}</Typography>
                            </Grid>
                           <Grid item xs={6}>
                               <Typography variant={"subtitle2"}>FECHA DE NACIMIENTO</Typography>
                               <Typography variant={"body1"}>{child.information.birthdate}</Typography>
                           </Grid>
                            <Grid item xs={6}>
                                <Typography variant={"subtitle2"}>NOMBRE</Typography>
                                <Typography variant={"body1"}>{child.information.name}</Typography>
                            </Grid>
                           <Grid item xs={6}>
                               <Typography variant={"subtitle2"}>APELLIDO</Typography>
                               <Typography variant={"body1"}>{child.information.lastname}</Typography>
                           </Grid>
                            <Grid item xs={6}>
                                <Typography variant={"subtitle2"}>MADRE</Typography>
                                <Typography variant={"body1"}>
                                    {child.mother ? `${child.mother.name} ${child.mother.lastname}` : 'Fallecida'}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant={"subtitle2"}>PADRE</Typography>
                                <Typography variant={"body1"}>
                                    {child.father ? `${child.father.name} ${child.father.lastname}` : 'Fallecido'}
                                </Typography>
                            </Grid>
                           <Grid item xs={12}>
                               <Typography variant={"subtitle2"}>REPRESENTANTE</Typography>
                               <Typography variant={"body1"}>
                                   {child.nonParent ? `${child.nonParent.name} ${child.nonParent.lastname}` : 'No tiene'}
                               </Typography>
                           </Grid>
                           <Grid item xs={6}>
                               <Typography variant={"subtitle2"}>TALLA DE SHORT O PANTALON</Typography>
                               <Typography variant={"body1"}>{child.attire.shortOrTrousersSize}</Typography>
                           </Grid>
                           <Grid item xs={6}>
                               <Typography variant={"subtitle2"}>TALLA DE CAMISA O CAMISETA</Typography>
                               <Typography variant={"body1"}>{child.attire.tshirtOrshirtSize}</Typography>
                           </Grid>
                           {child.attire.sweaterSize && (
                               <Grid item xs={6}>
                                   <Typography variant={"subtitle2"}>TALLA DE SUÉTER</Typography>
                                   <Typography variant={"body1"}>{child.attire.sweaterSize}</Typography>
                               </Grid>
                           )}
                           {child.attire.dressSize && (
                               <Grid item xs={6}>
                                   <Typography variant={"subtitle2"}>TALLA DE VESTIDO</Typography>
                                   <Typography variant={"body1"}>{child.attire.dressSize}</Typography>
                               </Grid>
                           )}
                           <Grid item xs={6}>
                               <Typography variant={"subtitle2"}>TALLA DE CALZADO</Typography>
                               <Typography variant={"body1"}>{child.attire.footwearSize}</Typography>
                           </Grid>
                           {relatedBeneficiaries &&
                               (<Grid item xs={12}>
                                    <Typography variant={"subtitle2"}>BENEFICIARIOS RELACIONADOS</Typography>
                                   {relatedBeneficiaries.map(({ id, information}, index) =>
                                       id ?
                                           (<Typography key={id} variant={"body1"}>{information?.name} {information?.lastname}</Typography>) :
                                           (<Typography key={index} variant={"body2"} color={"red"}>BENEFICIARIO ELIMINADO</Typography>)
                                   )}
                               </Grid>)}
                        </Grid>
                    </Box>
                </Box>
            </Fade>
        </Modal>
    )
}