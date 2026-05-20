import Drawer from "./drawer";
import { Popper, Paper, Fade } from "@mui/material";


export function FloatingDrawerPopper({ open, anchorEl, source_type, setStationPoints, state, dispatch, map, clearShapesRef}){
    return(
        <Popper
          id="floating-drawer-popper"
          open={open}
          anchorEl={anchorEl}
          placement="left-start"
          transition='true'
          
          sx={{
            zIndex: 1300,
            maxHeight: '81vh',
            overflowY: 'auto',
          }}
        >
          {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper
              elevation={4}
              sx={{
                width: 350,
                borderRadius: 2,
                overflow: "scroll",
              }}
            >
              
                <Drawer
                  element_id="left-side"
                  classes="left"
                  source_type={source_type}
                  setStationPoints={setStationPoints}
                  state={state}
                  dispatch={dispatch}
                  map={map}
                  clearShapesRef={clearShapesRef}
                />
              
            </Paper>
          </Fade>)}
        </Popper>
    )


}