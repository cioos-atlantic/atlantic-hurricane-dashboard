export default function HeaderNav({children, navItems}){
    return(
        <nav>
            <ul>
            {navItems.map(link => {
                return(
                    <li key={link.href}><a href={link.href}>{link.name}</a></li>
                )
            })}
            </ul>
        </nav>
    )
}
