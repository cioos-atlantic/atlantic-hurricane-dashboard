import styles from './drawer.module.css'

export default function Drawer({children, element_id, classes}){
    let other = null;

    switch(classes){
        case "left":
            other = styles.left;
            break;

        case "right":
            other = styles.right;
            break;
    }

    return(
        <div id={element_id} className={styles.drawer + " h-100 " + other}>
            <div className={styles.drawer_interior}>
                {children}
            </div>
        </div>
    )
}
