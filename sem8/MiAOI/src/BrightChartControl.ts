import {IColourUtils} from './ColourUtils'
declare type Chart = any;

export class BrightChartControl {
    protected _chartCanvas: HTMLCanvasElement = document.querySelector('#x_br_chart')!
    protected _ctx?: CanvasRenderingContext2D
    protected _chart?: Chart

    constructor(protected _utils: IColourUtils) {
    }

    public insertChart(ctx: CanvasRenderingContext2D) {
        this._ctx = ctx
        if(this._chart) {
            this._chart.destroy()
        }

        // Analyze matrix
        // Quantize brightness by 10 groups
        // Set each group value to a middle / like 50%
        // Map all indexes to their groups
        // On drag a group, make all pixels of this group brighter of less brighter
        const options = {
            type: 'line',
            data: {
                labels: ['a','b','c','d'],
                datasets: [{
                    label: 'brightness',
                    data: [0,1,2,3,4,5,6,7,8,9,10],
                    borderWidth: 1,
                    pointHitRadius: 25
                }]
            },
            options: {
                scales: {
                    y: {
                        max: 100,
                        min: 0
                    }
                },
                responsive: false,
                onHover: function(e: any) {
                    const point = e.chart.getElementsAtEventForMode(e, 'nearest', {
                        intersect: true
                    }, false)
                    if (point.length) e.native.target.style.cursor = 'grab'
                    else e.native.target.style.cursor = 'default'
                },
                plugins: {
                    dragData: {
                        round: 1,
                        showTooltip: true,
                        onDragStart: function(e: any) {
                            // console.log(e)
                        },
                        onDrag: function(e: any, datasetIndex: any, index: any, value: any) {
                            e.target.style.cursor = 'grabbing'
                            //console.log(datasetIndex, index, value)
                        },
                        onDragEnd: function(e: any, datasetIndex: any, index: any, value: any) {
                            e.target.style.cursor = 'default'
                            // console.log(datasetIndex, index, value)
                        },
                    }
                }
            }
        }

        let chartCtx: CanvasRenderingContext2D = this._chartCanvas.getContext('2d')!;
        // @ts-ignore
        this._chart = new Chart(chartCtx, options);
    }
}