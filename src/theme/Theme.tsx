import {ThemeOptions} from "@mui/material";
import {createTheme} from "@mui/material/styles";

const themeOptions: ThemeOptions = {
    palette: {
        primary: {
            main: '#488aaa',
            light: '#7ab9dc',
            dark: '#065c7b'
        },
        secondary: {
            main: '#18191f',
            light: '#3e3f46',
            dark: '#000000'
        },
        background: {
            default: '#eeeeee',
        },
    },
};

export const Theme = createTheme(themeOptions)