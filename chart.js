WSPCStatus.chart = (function () {
    var CHART_IMG = 'images/chart.gif', //Background picture for the chart
        W_CHART = 265, //Width of the chart
        H_CHART = 165, //Height of the chart
        X_CHART_OFFSET = 30,
        Y_CHART_OFFSET = 30,
        
        BORDER_CHART = 1,
        
        X_START = X_CHART_OFFSET + 4,
        Y_START = H_CHART + Y_CHART_OFFSET - 2,
        
        METRICS_COUNT = 5, //Number of values on y axis
        METRICS_OFFSET = 31, //Offfset between the values on y axis in pixels
        
        BARS_COUNT = 10, //Number of bars 
        BARS_OFFSET = 10, //Offset between the bars
        BARS_START_X = 10,
        
        BAR_WIDTH = 15, //Bar width in pixels
        
        LABELS_OFFSET = -8,
        
        TITLE_FONT = '11pt Arial',
        CHART_FONT = '8pt Arial',
        
        COLORS = [
            '#6799FF', //dns color
            '#FF843C', //connect color
            '#C7AD5C', //redirect color
            '#00237E', //first byte color
            '#34915B', //last byte color,
            '#347e91', //response time
            '#F33939' //error color
        ],
        LEGEND = [
            'DNS',
            'Connect',
            'Redirect',
            'First',
            'Last',
            'Response',
            'Error'
        ],
        LEGEND_SIZE = [
            45,
            60,
            60,
            40,
            40,
            68, 
            60
        ],
        PROP_MAP = [
            'dnsTime',
            'connectTime',
            'redirectTime',
            'firstbyteTime',
            'lastbyteTime',
            'responseTime',
            'error'
        ],
        LEGEND_BOX_SIZE = 10;
        
    return {
        draw : function (ctx, data) {
            var chart = this,
                img = new Image(),
                hasTests = typeof data.tests != 'undefined',
                maxVal = (hasTests && chart.getMaxValue(data.tests));
                    
            img.onload = function () {
                ctx.textBaseline = 'middle';
                ctx.font = CHART_FONT;
                
                ctx.drawImage(img, X_CHART_OFFSET, Y_CHART_OFFSET);

                chart.drawTitle(ctx, data.label);                            
                
                if (hasTests) {
                    ctx.save();
                        ctx.textAlign = 'right';
                        ctx.translate(X_START, Y_START);
                        
                        chart.drawMetrics(ctx, maxVal);
                        chart.drawLabels(ctx, data.tests);
                        chart.drawBars(ctx, data.tests, maxVal);
                        chart.drawLegend(ctx, data.tests[0]);
                        
                    ctx.restore();
                }
                else {
                    chart.drawError(ctx, data.error);
                }
            };
            img.src = CHART_IMG;
        },
        
        drawTitle : function (ctx, title) {
            ctx.save();
                ctx.font = TITLE_FONT;
                ctx.textAlign = 'center';
                ctx.fillText(title, X_START + (W_CHART / 2), Y_CHART_OFFSET / 2);
            ctx.restore();
        },
        
        drawMetrics : function (ctx, max) {
            var step = max / METRICS_COUNT;
                
            for (var i = 0, j = 0; i < METRICS_COUNT; i++, j += step) {
                ctx.fillText(j.toFixed(2), LABELS_OFFSET, -(i * METRICS_OFFSET)); 
            }
        },
        
        drawLabels : function (ctx, labels) {
            var barCenter = BAR_WIDTH / 2,
                date;
            ctx.save();
                ctx.translate(BARS_START_X, 0);
                ctx.rotate(-(Math.PI / 2));
                for (var i = 0, j = 0, len = labels.length; i < len; i++, j += BAR_WIDTH) {
                    date = new Date(labels[i].date);
                    ctx.fillText(('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2), LABELS_OFFSET, (i * BARS_OFFSET) + barCenter + j);
                }
            ctx.restore();
        },
        
        drawBars : function (ctx, values, max) {
            var step = ((METRICS_COUNT * METRICS_OFFSET) - BORDER_CHART) / max,
                currBar, barOffset, 
                currVal;
            
            ctx.save();
                ctx.translate(BARS_START_X, -1);
                
                for (var i = 0, j = 0, len = values.length; i < len; i++, j += BAR_WIDTH) {
                    barOffset = (i * BARS_OFFSET) + j;
                    currBar = values[i];
                    
                    for (var k = PROP_MAP.length; k--;) { 
                        currVal = currBar[PROP_MAP[k]];
                        if (currVal > 0) {
                            ctx.fillStyle = COLORS[k];
                            ctx.fillRect(barOffset, PROP_MAP[k] == 'error' ? -1 : 0, BAR_WIDTH, -(currVal * step)); 
                        }
                    }
                                                                                                                                                     
                }
            ctx.restore();
        },
        
        drawLegend : function (ctx, data) {
            var legendIdx = [],
                i, j, len;
                
            for (i = 0, len = PROP_MAP.length - 1; i < len; i++) {
                if (typeof data[PROP_MAP[i]] != 'undefined') {
                    legendIdx.push(i);
                }
            }
            legendIdx.push(LEGEND.length - 1);
            
            ctx.save();
                ctx.translate(-32, 45);
                ctx.textAlign = 'left';
                for (i = 0, len = legendIdx.length; i < len; i++) {
                    j = legendIdx[i];
                    
                    ctx.fillStyle = COLORS[j];
                    ctx.fillRect(0, 0, LEGEND_BOX_SIZE, LEGEND_BOX_SIZE);
                    
                    ctx.fillStyle = '#000000';
                    ctx.fillText(LEGEND[j], LEGEND_BOX_SIZE + 5, LEGEND_BOX_SIZE / 2);
                    
                    ctx.translate(LEGEND_SIZE[j], 0);
                }
            ctx.restore();
        },
        
        drawError : function (ctx, msg) {
            ctx.save();
                ctx.textAlign = 'center';
                ctx.fillText(msg, X_START + (W_CHART / 2), (H_CHART / 2) + Y_CHART_OFFSET);
            ctx.restore();            
        },
        
        getMaxValue : function (tests) {
            var max = 0,
                currMax = 0;
            for (var i = tests.length; i--;) {
                for (var j = PROP_MAP.length; j--;) {
                    currMax = Math.max(currMax, +tests[i][PROP_MAP[j]] || 0);
                }
                if (currMax > max) {
                    max = currMax;
                }
            }
            
            for (i = tests.length; i--;) {
                if (tests[i].status != 'N') {
                    tests[i].error = max;
                }
            }
            return max;
        }
    };
})();
