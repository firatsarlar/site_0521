import { h, Component, Fragment } from "preact";
import { Router, Link, route } from "preact-router";

interface LR_Props {
    path?: string;
}
class LangRedirect extends Component<LR_Props, any> {

    componentWillMount() {

        this.redirectLanguage();
    }

    private redirectLanguage(): void {
        const navigatorlanguage = navigator.languages && navigator.languages[0] || navigator.language;
        const { routes, isDev, language } = window.__ctx;
        const path = this.props.path;

        let redirect;

        if (language == "en" || path == "en")
            redirect = "/en/" + routes.en[0].link;
        else if (language == "de" || path == "de")
            redirect = "/de/" + routes.de[0].link;
        else if (navigatorlanguage.startsWith("en"))
            redirect = "/en/" + routes.en[0].link;
        else
            redirect = "/de/" + routes.de[0].link;

        if (isDev)
            console.log("lang redirect ", redirect);

        route(redirect, true);
    }

    render() {
        return null;
    }
}
export default LangRedirect;