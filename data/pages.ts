import strings from "./strings";
import {createTitle, LanguageBasedRoutes, RouteDefinition, PageHead} from "./page_interfaces";

const strEn = strings.en;
const strDe = strings.de;

const pages : LanguageBasedRoutes = {
    en:[
        {
            menu_display: strEn.home_page,
            component:"home",
            pageHead:{
                head_title:createTitle(strEn.home_page),
                
            },
            path:"home"

        },
        {
            menu_display: strEn.projects,
            component:"home",
            visibleInMobile: false,
            subRoutes:[
                {
                    menu_display:strEn.individual_stands,
                    path:"individual_stands",
                    pageHead:{
                        head_title:createTitle(strEn.individual_stands),
                        
                    },
                    extraMatchesMap:["project"]
                    
                },
                {
                    menu_display:strEn.pavilions,
                    path:"pavilions",
                    pageHead:{
                        head_title:createTitle(strEn.pavilions),
                        
                    },
                    extraMatchesMap:["project"]

                }
            ]
        },
        {
            menu_display:strEn.about_us,
            component:"home",
            path:"about_us",
            pageHead:{
                head_title:createTitle(strEn.about_us)
            }
        },
        {
            menu_display:strEn.philosophy,
            component:"home",
            path:"philosophy",
            pageHead:{
                head_title:createTitle(strEn.philosophy)
            }
        },
        {
            menu_display:strEn.team,
            component:"home",
            path:"team",
            pageHead:{
                head_title:createTitle(strEn.team)
            }
        },
        {
            menu_display:strEn.contact,
            component:"home",
            path:"contact",
            pageHead:{
                head_title:createTitle(strEn.contact)
            }
        },
        {
            menu_display:strEn.imprint,
            component:"imprint",
            path:"imprint",
            isFooterMenu:true,
            pageHead:{
                head_title:createTitle(strEn.imprint)
            }
        }
    ],
    de:[{
        menu_display: strDe.home_page,
        component:"home",
        pageHead:{
            head_title:createTitle(strDe.home_page),
            
        },
        path:"startseite"

    },
    {
        menu_display: strDe.projects,
        component:"home",
        visibleInMobile: false,
        subRoutes:[
            {
                menu_display:strDe.individual_stands,
                path:"individuelle_stande",
                pageHead:{
                    head_title:createTitle(strDe.individual_stands),
                    
                },
                extraMatchesMap:["project"]
                
            },
            {
                menu_display:strDe.pavilions,
                path:"gemeinschaftsstande",
                pageHead:{
                    head_title:createTitle(strDe.pavilions),
                    
                },
                extraMatchesMap:["project"]

            }
        ]
    },
    {
        menu_display:strDe.about_us,
        component:"home",
        path:"uber_uns",
        pageHead:{
            head_title:createTitle(strDe.about_us)
        }
    },
    {
        menu_display:strDe.philosophy,
        component:"home",
        path:"philosophie",
        pageHead:{
            head_title:createTitle(strDe.philosophy)
        }
    },
    {
        menu_display:strDe.team,
        component:"home",
        path:"team",
        pageHead:{
            head_title:createTitle(strDe.team)
        }
    },
    {
        menu_display:strDe.contact,
        component:"home",
        path:"kontakt",
        pageHead:{
            head_title:createTitle(strDe.contact)
        }
    },
    {
        menu_display:strDe.imprint,
        component:"imprint",
        path:"impressum",
        isFooterMenu:true,
        pageHead:{
            head_title:createTitle(strDe.imprint)
        }
    }]

}

export default pages;