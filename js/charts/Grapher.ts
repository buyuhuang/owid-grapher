import ChartView from './ChartView'
import {throttle} from './Util'

interface LoadableFigure {
    configUrl: string
    queryStr: string
    element: HTMLElement
    jsonConfig?: any
    isActive?: true
}

export class MultiEmbedder {
    figuresToLoad: LoadableFigure[] = []
    constructor() {
        Array.from(document.getElementsByTagName("figure")).forEach(element => {
            const dataSrc = element.getAttribute('data-grapher-src')
            if (dataSrc) {
                const [configUrl, queryStr] = dataSrc.split(/\?/)
                const figure: LoadableFigure = { configUrl, queryStr, element }
                this.figuresToLoad.push(figure)

                fetch(configUrl).then(data => data.text()).then(html => {
                    const m = html.match(/jsonConfig\s*=\s*(\{.+\})/)
                    if (m)
                        figure.jsonConfig = JSON.parse(m[1])
                    this.update()
                })
            }
        })

        window.addEventListener('scroll', throttle(() => this.update(), 100))
    }

    // Check for figures which are available to load and load them
    update() {
        const preloadDistance = window.innerHeight*4
        this.figuresToLoad.forEach(figure => {
            if (!figure.isActive && figure.jsonConfig) {
                const windowTop = window.pageYOffset
                const windowBottom = window.pageYOffset + window.innerHeight
                const figureRect = figure.element.getBoundingClientRect()
                const bodyRect = document.body.getBoundingClientRect()
                const figureTop = figureRect.top-bodyRect.top
                const figureBottom = figureRect.bottom-bodyRect.top
                if (windowBottom+preloadDistance >= figureTop && windowTop-preloadDistance <= figureBottom) {
                    figure.isActive = true
                    ChartView.bootstrap({ jsonConfig: figure.jsonConfig, containerNode: figure.element, isEmbed: figure.element.parentNode !== document.body || undefined, queryStr: figure.queryStr })
                }
            }
        })
    }
}

// Global entry point for initializing charts
export default class Grapher {
    // Look for all <figure data-grapher-src="..."> elements in the document and turn them
    // into iframeless embeds
    static embedder: MultiEmbedder
    static embedAll() {
        this.embedder = new MultiEmbedder()
    }
}
