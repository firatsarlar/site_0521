import { h, Fragment } from "preact";
import { Link } from "preact-router";


const Page404 = (props) => {
    
    const { strings,routes } = window.__ctx;
    

    return (
        <div class="p404" >
            <span class="i-exc">!</span><br />
            {strings.en["404"]}<br />
            {strings.de["404"]}<br /><br />

            <Link href={"/de/" + routes.de[0].link}>{strings.de.ReturnHome}<br /></Link>
            <Link href={"/en/" + routes.en[0].link}>{strings.en.ReturnHome}<br /></Link>
        </div>

    )
};

export default Page404;