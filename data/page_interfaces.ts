import strings from "./strings";

export interface PageHead {
    meta_desc?: string
    head_title?: string
    keywords?: Array<string>
}
export interface RouteDefinition {
    menu_display?: string | undefined
    path?: string | undefined
    component?: string
    subRoutes?: Array<RouteDefinition>
    pageHead?: PageHead
    extraMatchesMap?: Array<string>
    isFooterMenu?: boolean | undefined
    visibleInMobile?: boolean | undefined

}
export interface LanguageBasedRoutes {
    en?: Array<RouteDefinition>
    de?: Array<RouteDefinition>
}
export function createTitle(append: string, lang: string = "en") {
    return `${strings[lang].companyTitle} > ${append}`;
}