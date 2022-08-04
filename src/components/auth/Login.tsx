import { Button, Container, Grid, Paper, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import logo from "../../favicon.png";
import { AuthenticationRequest } from "../../types/auth";
import * as authApi from "../../api/auth";
import { useAppDispatch } from "../../store";
import { setLoggedIn } from "../../store/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const {
      control,
      formState: { isValid, errors },
      handleSubmit,
    } = useForm<AuthenticationRequest>({
      defaultValues: {
        username: "",
        password: "",
      },
      mode: "all",
    }),
    navigate = useNavigate(),
    dispatch = useAppDispatch(),
    login = (request: AuthenticationRequest) =>
      authApi.login(request).then((success) => {
        if (success) {
          dispatch(setLoggedIn());
          navigate("/");
        } else if (success === null)
          window.alert(
            "¡Ups! Ocurrió algo inesperado al tratar de iniciar sesión, por favor, comprueba tu conexión a internet e intenta de nuevo"
          );
        else window.alert("Credenciales inválidas");
      });

  return (
    <main style={{ flex: "1 1 auto", backgroundColor: "#eee" }}>
      <Container
        maxWidth="xl"
        sx={{
          pt: 4,
          pb: 12,
          gap: 4,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Paper
          elevation={6}
          sx={{ p: 3, m: "auto", display: "grid", gap: 6, width: "300px" }}
        >
          <img src={logo} style={{ width: "100px", margin: "auto" }} />
          <form onSubmit={handleSubmit(login)}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  control={control}
                  name="username"
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      placeholder="Nombre de Usuario"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  control={control}
                  name="password"
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="password"
                      fullWidth
                      placeholder="Contraseña"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  disabled={!isValid || Object.keys(errors).length > 0}
                  size="large"
                  type="submit"
                  variant="contained"
                  fullWidth
                >
                  Iniciar sesion
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </main>
  );
}
