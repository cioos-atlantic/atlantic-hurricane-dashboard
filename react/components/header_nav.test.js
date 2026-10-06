import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HeaderNav from './header_nav'

const navItems = [
  { name: 'Home', href: '/ocean-storm-viewer' },
  { name: 'Active Storms', href: '/ocean-storm-viewer?storms=active' },
]

describe('HeaderNav', () => {
  it('renders a link for each nav item with the correct text and href', () => {
    render(<HeaderNav navItems={navItems} />)

    navItems.forEach((item) => {
      const links = screen.getAllByRole('link', { name: item.name })
      expect(links.length).toBeGreaterThan(0)
      links.forEach((link) => expect(link).toHaveAttribute('href', item.href))
    })
  })

  it('does not show the mobile drawer links until the menu icon is clicked', () => {
    render(<HeaderNav navItems={navItems} />)

    expect(screen.queryByText('Active Storms', { selector: '.header-drawer-small-screens' })).not.toBeInTheDocument()
  })

  it('opens the drawer, revealing its own copy of the nav links, when the menu icon is clicked', async () => {
    const user = userEvent.setup()
    render(<HeaderNav navItems={navItems} />)

    expect(screen.queryByText('Home', { selector: '.header-drawer-small-screens' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /menu/i }))

    expect(screen.getByText('Home', { selector: '.header-drawer-small-screens' })).toHaveAttribute(
      'href',
      '/ocean-storm-viewer'
    )
  })
})
