let topogramAgua = function (options) {
    let self = {};
    for (let key in options) {
        self[key] = options[key];
    }

    self.parent_select = "#" + self.parent_id;
    self.url_topo = 'data/UH-quantized.topojson';
    self.url_deps = 'data/peru-min.topojson';
    self.url_licencias = 'data/licencias.csv';

    self.center = [-74.991903, -9.814378388527897];
    self.scale = 1400;

    self.body = d3.select("body");
    self.stat = d3.select("#status");

    self.filter_dh = {
        'Alta': true,
        'Media': true,
        'Baja': true
    };

    self.custom_color = {
        'Alta': "#ffeda0",
        'Media': "#feb24c",
        'Baja': "#ff4b4b",
        'default': "#242424",
    };

    self.data = {
        'cuencas': {},
        'empresas': {},
        'departamentos': {},
        'licencias': [],
    };

    self.departamento_selected = 'todos';
    self.empresa_selected = 'todos';

    self.transform = d3.zoomIdentity;

    self.init = function () {
        self.projection = d3.geoMercator()
            .scale(self.scale)
            .center(self.center)
            .translate([self.width / 2, self.height / 2]);

        self.path = d3.geoPath().projection(self.projection);

        self.cartogram = d3.cartogram()
            .projection(self.projection)
            .properties(function (d) {
                return d.properties;
            })
            .value(function (d) {
                return 1;
            });

        self.svg = d3.select(self.parent_select);
        self.g = self.svg.append("g").attr('opacity', 1);
        self.g1 = self.g.append("g").attr('opacity', 0);
        self.g2 = self.g.append("g");
        self.layer = self.g1.append("g")
            .attr("id", "layer");
        self.states = self.layer.append("g")
            .attr("id", "states")
            .selectAll("path");

        self.loadData();

        self.zoom = d3.zoom()
            .scaleExtent([1, 4])
            .on("zoom", function () {
                self.transform = d3.event.transform;
                self.g.attr("transform", self.transform);
            });

        self.svg.call(self.zoom);
    };

    self.loadData = function () {
        d3.json(self.url_topo, function (topo) {
            self.prerenderCuencas(topo);

            d3.json(self.url_deps, function (error, departamentos) {
                if (error) throw error;
                self.renderDepartamentos(departamentos);

                d3.csv(self.url_licencias, function (licencias) {
                    self.prepareLicencias(licencias);
                    self.renderCuencas('area');
                    self.updateForm();
                    self.updateResults();

                    self.states
                        .attr("id", function (d, i) {
                            d.id = i;
                            return 'path-' + d.id;
                        })
                        .attr("a", function (d) {
                            if (self.data.cuencas[d.properties.CODIGO] !== undefined) {
                                self.data.cuencas[d.properties.CODIGO].d = d;
                            }
                        });

                    $(".btn-go").click(function () {
                        $(".landing").css('opacity', 0);
                        setTimeout(function () {
                            $(".landing").css('display', 'none');
                        }, 250);

                        setTimeout(function () {
                            self.g1.transition().duration(500).ease(d3.easeLinear).attr('opacity', 1);
                            self.g2.transition().duration(1250).ease(d3.easeLinear).attr('opacity', 0);

                            setTimeout(function () {
                                self.states.transition()
                                    .duration(750)
                                    .ease(d3.easeLinear)
                                    .attr("fill", function (d) {
                                        if (self.data.cuencas[d.properties.CODIGO] !== undefined) {
                                            return self.custom_color[self.data.cuencas[d.properties.CODIGO].DH];
                                        }
                                        return self.custom_color['default'];
                                    });

                                $(".dh-check").addClass("selected");

                                setTimeout(function () {
                                    $(".switch-box").toggleClass('off');
                                    let key = $(this).hasClass('off') ? 'area' : 'resoluciones';
                                    self.renderCuencas(key);
                                }, 500);
                            }, 1500);
                        }, 1500);
                    });
                });
            });
        });
    };

    self.renderDepartamentos = function (departamentos) {
        self.geodata_deps = topojson.feature(departamentos, departamentos.objects.peru);

        self.g2
            .selectAll("path")
            .data(self.geodata_deps.features)
            .enter()
            .append("path")
            .attr("fill", self.custom_color['default'])
            .style("opacity", 1)
            .style("pointer-events", "none")
            .attr("d", self.path);
    };

    self.prerenderCuencas = function (topo) {
        self.topology = topo;
        self.geometries = self.topology.objects.UH.geometries;

        self.states = self.states
            .data(self.cartogram.features(self.topology, self.geometries))
            .enter()
            .append("path")
            .attr("fill", self.custom_color['default'])
            .attr("d", self.path)
            .on('mousemove', function (d) {
                self.showTooltip(d);
            })
            .on('mouseout', function () {
                self.hideTooltip();
            })
            .on('click', function (d, i) {
                self.showInfo(self.cuencas_feautres[i]);
            });
    };


    self.prepareLicencias = function (licencias) {
        self.licencias = licencias;
        licencias.forEach(licencia => {
            const id = licencia['CÓDIGO DE CUENCA'],
                razon_social = licencia['RAZÓN SOCIAL'],
                departamento = licencia.DEPARTAMENTO;

            if (self.data.cuencas[id] === undefined) {
                self.data.cuencas[id] = {
                    'id': id,
                    'nombre': licencia.CUENCA,
                    'tipo_uso': {
                        'Industrial': 0,
                        'Minero': 0,
                        'Doméstico': 0,
                        'Poblacional': 0,
                        'Energético': 0,
                        'Agrícola': 0,
                        'Otros usos': 0
                    },
                    'clase': {
                        'Superficial': 0,
                        'Subterráneo': 0,
                    },
                    'resolucion': {
                        'Autorización': 0,
                        'Licencia': 0,
                        'Permiso': 0,
                    },
                    'dh': licencia['DISPONIBILIDAD HÍDRICA'],
                    'ala': licencia['AUTORIDAD LOCAL DEL AGUA (ALA)'],
                    'aaa': licencia['AUTORIDAD ADMINISTRATIVA DEL AGUA (AAA)'],
                    'departamentos': [],
                    'empresas': [],
                    'provincia': licencia.PROVINCIA,
                    'distrito': licencia.DISTRITO,
                    'nro_licencias': 0,
                };
            }

            self.data.cuencas[id].nro_licencias += 1;
            self.data.cuencas[id].DH = licencia['DISPONIBILIDAD HÍDRICA'];
            if ($.inArray(departamento, self.data.cuencas[id].departamentos) == -1) {
                self.data.cuencas[id].departamentos.push(departamento);
            }
            if ($.inArray(razon_social, self.data.cuencas[id].empresas) == -1) {
                self.data.cuencas[id].empresas.push(razon_social);
            }
            var clase = licencia['CLASE DE FUENTE'];
            self.data.cuencas[id].clase[clase] += 1;
            var tipo_uso = licencia['TIPO DE USO'];
            self.data.cuencas[id].tipo_uso[tipo_uso] += 1;
            var resolucion = licencia['TIPO DE PERMISO'];
            self.data.cuencas[id].resolucion[resolucion] += 1;

            if (self.data.empresas[razon_social] === undefined) {
                self.data.empresas[razon_social] = {
                    'name': razon_social,
                    'ruc': licencia['N DE RUC'],
                    'afectados': '',
                    'conflictos': [],
                    cuencas: []
                };
            }

            if (self.data.departamentos[departamento] === undefined) {
                self.data.departamentos[departamento] = {
                    'name': departamento,
                    empresas: []
                };
            }
            if ($.inArray(razon_social, self.data.departamentos[departamento].empresas) == -1) {
                self.data.departamentos[departamento].empresas.push(razon_social);
            }
        });

        d3.csv('data/afectados.csv', function (afectados) {
            $.each(afectados, function (key, d) {
                var razon_social = d['RAZÓN SOCIAL'];
                if (self.data.empresas[razon_social] !== undefined) {
                    self.data.empresas[razon_social].afectados = d['MUERTOS Y HERIDOS EN CONFLICTO'];
                }
            });
        });
        d3.csv('data/conflictos.csv', function (conflictos) {
            $.each(conflictos, function (key, d) {
                var razon_social = d['RAZÓN SOCIAL'];
                if (self.data.empresas[razon_social] !== undefined) {
                    self.data.empresas[razon_social].conflictos.push(d['CONFLICTOS SOCIALES VIGENTES']);
                }
            });
        });
    };

    self.updateForm = function () {
        self.updateDepartamentosSelect();
        self.updateEmpresasSelect();

        $("#close-info").click(function () {
            $(".modal").hide();
            $("body").removeClass('modal-active');
        });

        $("#tab1").click(function () {
            $("#block1").show();
            $("#block2").hide();
            $(".tabs li").removeClass('selected');
            $(this).addClass('selected');
        });
        $("#tab2").click(function () {
            $("#block2").show();
            $("#block1").hide();
            $(".tabs li").removeClass('selected');
            $(this).addClass('selected');
        });

        $(".switch-box").click(function () {
            $(".switch-box").toggleClass('off');
            let key = $(this).hasClass('off') ? 'area' : 'resoluciones';
            self.renderCuencas(key);
        });
    };

    self.updateDepartamentosSelect = function () {
        let temp = [];
        $.each(self.data.departamentos, function (key, element) {
            temp.push(element.name);
        });
        temp.sort();
        temp.forEach(function (element) {
            $("#select-departamento").append($("<option></option>").text(element));
        });

        $("#select-departamento").chosen();
        $("#select-departamento").change(function () {
            let val = this.value;
            self.departamento_selected = val;
            self.empresa_selected = 'todos';
            self.updateEmpresasSelect();
            self.updateResults();
        });
        self.updateEmpresasSelect();
    };

    self.updateEmpresasSelect = function () {
        $("#select-empresa").html('<option value="todos" selected>Todos</option>');

        let temp = [];
        if (self.departamento_selected == 'todos') {
            $.each(self.data.empresas, function (key, element) {
                temp.push(element.name);
            });
        } else {
            temp = self.current_empresas = self.data.departamentos[self.departamento_selected].empresas;
        }
        temp.sort();
        temp.forEach(function (element) {
            $("#select-empresa").append($("<option></option>").text(element));
        });

        $("#select-empresa").chosen();
        $("#select-empresa").trigger("chosen:updated");
        $("#select-empresa").change(function () {
            let val = this.value;
            self.empresa_selected = val;
            self.updateResults();
        });
    };

    self.updateResults = function () {
        $("#results").html('');

        if (self.departamento_selected == 'todos' && self.empresa_selected == 'todos') {
            $("#results-label").hide();
            return;
        } else {
            $("#results-label").show();
        }

        $.each(self.data.cuencas, function (key, cuenca) {
            if ((self.departamento_selected == 'todos' || $.inArray(self.departamento_selected, cuenca.departamentos) !== -1) &&
                (self.empresa_selected == 'todos' || $.inArray(self.empresa_selected, cuenca.empresas) !== -1)) {
                $("#results").append($("<div></div>", { class: cuenca.dh.toLowerCase(), 'data-key': key }).text(cuenca.nombre));
            }
        });

        $("#results div").click(function () {
            $("#cuenca-info").show();
            let key = $(this).data('key');
            self.showInfo(self.data.cuencas[key].d);
        });

        $("#results div").mouseover(function () {
            let key = $(this).data('key');
            self.showTooltip(self.data.cuencas[key].d, true);
        }).mouseout(function () {
            self.hideTooltip();
        });
    };

    self.showInfo = function (d) {
        let info = d3.select("#cuenca-info");

        if (self.data.cuencas[d.properties.CODIGO] !== undefined) {
            $(".modal").show();
            $("html,body").scrollTop(0);
            $("body").addClass('modal-active');

            info.select(".nombre").text(d.properties.NOMBRE);

            var tu = '';
            var total = 0;
            $.each(self.data.cuencas[d.properties.CODIGO].tipo_uso, function (key, ee) {
                if (ee > 0) {
                    tu += '<span>(' + ee + ')</span>' + key + '<br>';
                }
                total += ee;
            });
            info.select(".tipo-uso").html(tu);

            var ta = '';
            var plur = {
                'Autorización': 'Autorizaciones',
                'Licencia': 'Licencias',
                'Permiso': 'Permisos',
            };
            $.each(self.data.cuencas[d.properties.CODIGO].resolucion, function (key, ee) {
                if (ee > 1) {
                    ta += '<span>(' + ee + ')</span>' + plur[key] + '<br>';
                } else if (ee == 1) {
                    ta += '<span>(' + ee + ')</span>' + key + '<br>';
                }
            });
            info.select(".tipo-resolucion").html(ta);

            //
            var cf = self.data.cuencas[d.properties.CODIGO].clase;

            var chart = bb.generate({
                bindto: "#chart-fuente",
                "size": {
                    "height": 160,
                    "width": 200,
                },
                data: {
                    type: "pie",
                    columns: [
                        ["Superficial", cf['Superficial']],
                        ["Subterráneo", cf['Subterráneo']]
                    ],
                    "colors": {
                        "Superficial": "#8da0cb",
                        "Subterráneo": "#ff4b4b"
                    }
                },
                "pie": {
                    "label": {
                        "format": function (value, ratio, id) {
                            // return d3.format('$')(value);
                            return value;
                        }
                    }
                },
                "tooltip": {
                    "format": {
                        "title": function (d) { return d; },
                        "value": function (value, ratio, id) {
                            return value;
                        }
                    }
                }
            });

            info.select(".total-resolucion").html('Total de resoluciones: ' + total);
            info.select(".disponibilidad-hidrica").text(self.data.cuencas[d.properties.CODIGO].dh);
            info.select(".ala").text(self.data.cuencas[d.properties.CODIGO].ala);
            info.select(".aaa").text(self.data.cuencas[d.properties.CODIGO].aaa);
            info.select(".departamento").text(self.data.cuencas[d.properties.CODIGO].departamentos.join(", "));


            // Empresas
            var total_empresas = self.data.cuencas[d.properties.CODIGO].empresas.length;
            var total_empresas_c = 0;
            var ff = true;
            $(".empresas-conflictos").html('');
            $.each(self.data.cuencas[d.properties.CODIGO].empresas, function (i, d) {
                var empresa = self.data.empresas[d];
                if (empresa.afectados !== '' || empresa.conflictos.length > 0) {
                    total_empresas_c += 1;

                    var el = $("<div></div>", { class: 'item' + (ff ? ' active' : '') });
                    var name = $("<div></div>", { class: 'razon-social' }).html('<img src="dist/images/wagon.png" /> ' + d);
                    var afectados = '';
                    var conflictos = $("<ul></ul>", { class: 'conflictos' });

                    if (empresa.afectados !== '') {
                        afectados = $("<div></div>", { class: 'afectados' }).text(empresa.afectados);
                    }

                    empresa.conflictos.forEach(function (zz) {
                        conflictos.append($("<li></li>", { class: 'conflicto' }).text(zz));
                    });

                    el.append(name).append(afectados).append(conflictos);

                    $(".empresas-conflictos").append(el);
                    ff = false;
                }
            });

            if (total_empresas_c == 0) {
                $.each(self.data.cuencas[d.properties.CODIGO].empresas, function (i, d) {
                    var el = $("<div></div>", { class: 'item' });
                    var name = $("<div></div>", { class: 'razon-social' }).html('<img src="dist/images/wagon.png" /> ' + d);

                    el.append(name);
                    $(".empresas-conflictos").append(el);
                });
            }

            $(".empresas-conflictos .item").click(function () {
                $(".empresas-conflictos .item").removeClass('active');
                $(this).addClass('active');
            });

            var empresas_texto = '';
            if (total_empresas > 0) {
                if (total_empresas == 1) {
                    empresas_texto = 'De <span>' + total_empresas + '</span> empresa que ocupa esta cuenca';
                } else {
                    empresas_texto = 'De las <span>' + total_empresas + '</span> empresas que ocupan esta cuenca';
                }
                if (total_empresas_c == 1) {
                    empresas_texto += ', <span>' + total_empresas_c + '</span> está vinculada a conflictos sociales.';
                } else {
                    empresas_texto += ', <span>' + total_empresas_c + '</span> están vinculadas a conflictos sociales.';
                }
            } else {
                if (total_empresas_c == 1) {
                    empresas_texto = '<span>' + total_empresas + '</span> empresa ocupa esta cuenca.';
                } else {
                    empresas_texto = '<span>' + total_empresas + '</span> empresas ocupan esta cuenca.';
                }
            }
            $("#block2 .total").html(empresas_texto);

            let cuenca_map = new cuencaMap({
                parent_id: 'cuenca-map',
                width: $("#cuenca-map").width(),
                height: $("#cuenca-map").height(),
            });
            cuenca_map.render(d, self.geodata_deps, self.projection, self.custom_color[self.data.cuencas[d.properties.CODIGO].DH]);
        } else {
            console.log('Sin información :' + d.properties);
        }
    };

    function getMyCentroid(d) {
        var element = d3.select("#path-" + d.id);
        var bbox = element.node().getBBox();
        return [bbox.x + bbox.width / 2, bbox.y + bbox.height / 2];
    }


    self.showTooltip = function (d, flag) {
        let tooltip = d3.select("#map-tooltip");
        let cords, left, top;
        if (!flag) {
            cords = d3.mouse(self.svg.node());
            left = cords[0];
            top = cords[1] - 10;
        } else {
            cords = getMyCentroid(d);
            cords = self.transform.apply(cords);
            left = cords[0];
            top = cords[1];
        }

        tooltip.select('.nombre').text(d.properties.NOMBRE);
        tooltip
            .style('display', 'block')
            .style('left', left + 'px')
            .style('top', top + 'px');
    };

    self.hideTooltip = function () {
        let tooltip = d3.select("#map-tooltip");
        tooltip.style('display', 'none');
    };

    self.deferredUpdate = (function () {
        let timeout;
        return function () {
            let args = arguments;
            clearTimeout(timeout);
            self.stat.text("calculating...");
            return timeout = setTimeout(function () {
                self.renderCuencas.apply(null, arguments);
            }, 10);
        };
    })();

    self.renderCuencas = function (key) {
        let start = Date.now();
        self.body.classed("updating", true);

        let value = function (d) {
            if (key == 'area') {
                // if (key == 'area' || (self.filter_dh['Alta'] == false && self.filter_dh['Media'] == false && self.filter_dh['Baja'] == false)) {
                return d.properties.Shape_Area;
            } else {
                if (self.data.cuencas[d.properties.CODIGO] === undefined ||
                    self.filter_dh[self.data.cuencas[d.properties.CODIGO].DH] === false)
                    return 0;
                return self.data.cuencas[d.properties.CODIGO].nro_licencias;
            }
        },
            values = self.states.data()
                .map(value)
                .filter(function (n) {
                    return !isNaN(n);
                })
                .sort(d3.ascending),
            lo = values[0],
            hi = values[values.length - 1];

        // normalize the scale to positive numbers
        let scale = d3.scaleLinear()
            .domain([lo, hi])
            .range([1, 700]);

        // tell the cartogram to use the scaled values
        self.cartogram.value(function (d) {
            return scale(value(d));
        });

        // generate the new features, pre-projected
        let features = self.cartogram(self.topology, self.geometries).features;

        if (key == 'area') {
            self.cuencas_feautres = features;
        }

        self.states.data(features);

        self.states.transition()
            .duration(750)
            .ease(d3.easeLinear)
            .attr("d", self.cartogram.path);

        let delta = (Date.now() - start) / 1000;

        self.stat.text(["calculated in", delta.toFixed(1), "seconds"].join(" "));
        self.body.classed("updating", false);
    };

    self.init();
    return self;
};

let topogram_agua = new topogramAgua({
    parent_id: 'map',
    width: $("#map").width(),
    height: $("#map").height()
});