export default function Drawer({children, element_id, classes}){
    return(
        <div id={element_id} className={"drawer " + classes}>
            {children}
        </div>
    )
}
