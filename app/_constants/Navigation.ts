export interface NavItem {
    name: string;
    href: string;
}
const Navigation: NavItem[] = [
    { name: "App", href: "https://gone.wtf/mixer" },
    { name: "Buy", href: "/#buytoken" },
    { name: "Contact", href: "https://t.me/gonedotwtf/" },
    { name: "About us", href: "https://docs.gone.wtf" },
    { name: "Faq", href: "https://gone.wtf/faq" },
];
export default Navigation;