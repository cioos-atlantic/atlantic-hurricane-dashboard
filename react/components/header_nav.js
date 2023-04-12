export default function HeaderNav({children, navItems}){
    return(
        <nav>
            <ul>
            {navItems.map(link => {
                return(
                    <li><a href={link.href}>{link.name}</a></li>
                )
            })}
            </ul>
        </nav>
    )
}
