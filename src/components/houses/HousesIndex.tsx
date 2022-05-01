import { AddOutlined, TodayOutlined } from "@mui/icons-material";
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
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import notFoundImage from "../../assets/not-found-image.jpeg";

type HousesList = {
  houses: any[] | null;
};

type HouseImages = {
  [id: string]: URL;
};

export default function HousesIndex() {
  const firstFill = useMemo(() => new Array(3).fill(1), []),
    [list, setList] = useState<HousesList>({ houses: null }),
    [filter, setFilter] = useState<string>(""),
    houses = useMemo(
      () =>
        list.houses
        ?.filter(house => house.name.toLowerCase().includes(filter.toLowerCase()))
        .reduce((chunks, _, index, arr) => {
          return (index % 4 == 0)
            ? [arr.slice(index, index + 4), ...chunks]
            : chunks;
        }, []),
      [list, filter]
    )
  console.log(filter)

  useEffect(() => {
    fetch("http://localhost:3500/houses")
      .then((response) => response.json())
      .then((list) => setList({ houses: list }));
  }, []);

  return (
    <>
      <Box sx={{ display: "flex", gap: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Buscar casa hogar"
          sx={{ backgroundColor: "#eee" }}
          onChange={e => setFilter(e.target.value)}
        ></TextField>
        <Button variant="contained" component={RouterLink} to="crear">
          <AddOutlined fontSize="large" />
        </Button>
        <Button variant="contained">
          <TodayOutlined fontSize="large" />
        </Button>
      </Box>
      <Box sx={{ pt: 6 }}>
        <Grid container spacing={4}>
          {!list.houses &&
            firstFill.map((_, index) => (
              <React.Fragment key={index}>
                <Grid item xs={3}>
                  <Paper variant="outlined" sx={{ px: 2, pt: 0, pb: 3 }}>
                    <Skeleton height={150} />
                    <Skeleton height={30} />
                  </Paper>
                </Grid>
                <Grid item xs={3}>
                  <Paper variant="outlined" sx={{ px: 2, pt: 0, pb: 3 }}>
                    <Skeleton height={150} />
                    <Skeleton height={30} />
                  </Paper>
                </Grid>
                <Grid item xs={3}>
                  <Paper variant="outlined" sx={{ px: 2, pt: 0, pb: 3 }}>
                    <Skeleton height={150} />
                    <Skeleton height={30} />
                  </Paper>
                </Grid>
                <Grid item xs={3}>
                  <Paper variant="outlined" sx={{ px: 2, pt: 0, pb: 3 }}>
                    <Skeleton height={150} />
                    <Skeleton height={30} />
                  </Paper>
                </Grid>
              </React.Fragment>
            ))}
          {houses &&
            houses.map(
              (houseGroup: [any?, any?, any?, any?], index: number) => (
                <React.Fragment key={index}>
                  {houseGroup.map((house) => (
                    <Grid item xs={3} key={house.id}>
                      {house && (
                        <Card variant="outlined" sx={{ height: '100%', display: 'grid' }}>
                          <CardMedia
                            component="img"
                            height={150}
                            image={`http://localhost:3500/houses/${house.id}/image`}
                            onError={(e: any) => {
                              e.preventDefault()
                              e.target.src = notFoundImage
                            }}
                          />
                          <CardContent>
                            <Typography
                              component="p"
                              sx={{ fontWeight: 600 }}
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
                          <CardActions sx={{ mt: 'auto' }}>
                            <Button variant="outlined">Editar</Button>
                            <Button color="error" variant="outlined">
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
