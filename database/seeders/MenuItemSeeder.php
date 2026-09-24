<?php

namespace Database\Seeders;

use App\Models\MenuItem;
use Illuminate\Database\Seeder;

class MenuItemSeeder extends Seeder
{
    public function run(): void
    {

        $create = function (
            string $title,
            ?int $parentId,
            int $order,
            ?string $url = null,
            ?string $destinationType = null
        ): MenuItem {
            return MenuItem::create([
                'parent_id' => $parentId,

                'title' => $title,

                'destination_type' => $destinationType
                    ?? ($url ? 'url' : null),

                'url' => $url,

                'file_path' => null,

                'order' => $order,

                'is_active' => true,
            ]);
        };


        /*
        |--------------------------------------------------------------------------
        | NIVEL PRINCIPAL
        |--------------------------------------------------------------------------
        */

        $inicio = $create(
            'INICIO',
            null,
            1,
            '/'
        );

        $institucional = $create(
            'INSTITUCIONAL',
            null,
            2,
            null
        );

        $autogestionTurnos = $create(
            'AUTOGESTIÓN DE TURNOS',
            null,
            3,
            'http://turnos.hospital.uncu.edu.ar/formulario'
        );

        $gestiones = $create(
            'GESTIONES',
            null,
            4,
            null
        );

        $comunicacion = $create(
            'COMUNICACIÓN EN LÍNEA',
            null,
            5,
            null
        );

        $covid = $create(
            'COVID-19',
            null,
            6,
            null
        );

        $protocolos = $create(
            'PROTOCOLOS',
            null,
            7,
            null

        );

        $unidadQuirurgica = $create(
            'UNIDAD QUIRÚRGICA',
            null,
            8,
            null
        );

        $propuestasTrabajo = $create(
            'PROPUESTAS DE TRABAJO',
            null,
            9,
            null
        );

        $formulariosAdministrativos = $create(
            'FORMULARIOS ADMINISTRATIVOS',
            null,
            10
        );

        $digestoHu = $create(
            'DIGESTO HU',
            null,
            11,
            'https://digesto.uncuyo.edu.ar/hu'
        );

        $buscadorProfesionales = $create(
            'BUSCADOR DE PROFESIONALES',
            null,
            12,
            'https://datastudio.google.com/u/0/reporting/2bdff34c-598f-42aa-a0ed-59d1a8ca0965/page/G5nuF'
        );


        /*
        |--------------------------------------------------------------------------
        | INSTITUCIONAL
        |--------------------------------------------------------------------------
        */

        $create(
            'ORDENANZA N°70',
            $institucional->id,
            1,
            null
        );

        $create(
            'ESTRUCTURA ORGÁNICO FUNCIONAL',
            $institucional->id,
            2,
            null
        );

        $comitesAsesores = $create(
            'COMITÉS ASESORES',
            $institucional->id,
            3,
            null
        );

        $create(
            'RES. APROBACIÓN DE COMITÉS',
            $comitesAsesores->id,
            1,
            null
        );

        $create(
            'CALIDAD',
            $comitesAsesores->id,
            2,
            null
        );

        $create(
            'GESTIÓN DE RIESGOS',
            $comitesAsesores->id,
            3,
            null
        );

        $create(
            'SEG. Y CONTROL DE INFECCIONES',
            $comitesAsesores->id,
            4,
            null
        );

        $create(
            'HISTORIA CLÍNICA',
            $comitesAsesores->id,
            5,
            null
        );


        /*
        |--------------------------------------------------------------------------
        | GESTIONES
        |--------------------------------------------------------------------------
        */

        $gestionAdministrativa = $create(
            'GESTIÓN ADMINISTRATIVA',
            $gestiones->id,
            1,
            null
        );

        $gestionAsistencial = $create(
            'GESTIÓN ASISTENCIAL',
            $gestiones->id,
            2,
            null
        );

        $gestionAcademica = $create(
            'GESTIÓN ACADÉMICA',
            $gestiones->id,
            3,
            null
        );

        $controlGestion = $create(
            'CONTROL DE GESTIÓN',
            $gestiones->id,
            4,
            null
        );


        /*
        |--------------------------------------------------------------------------
        | GESTIÓN ADMINISTRATIVA
        |--------------------------------------------------------------------------
        */

        $administrativaItems = [
            [
                'title' => 'SISTEMA DE DOCUMENTACIÓN',
                'url' => 'http://172.22.118.101:81/documentacionjd/public/login'
            ],
            [
                'title' => 'SISTEMA DE CONVENIOS',
                'url' => 'http://172.22.118.101:81/convenios/public'
            ],
            [
                'title' => 'DIGESTO ADMINISTRATIVO 2024',
                'url' => 'http://172.22.118.101:81/digestohunew/public/'
            ],
            [
                'title' => 'DIGESTO ADMINISTRATIVO 2011 / 2023',
                'url' => 'http://172.22.112.201/citdigesto/1.0/'
            ],
            [
                'title' => 'SISTEMA REPOSITORIO DE CURRICULUM',
                'url' => 'http://172.22.118.101:81/currihu/public/'
            ],
            [
                'title' => 'REPOSITORIO DE PROCESOS',
                'url' => null
            ],
            [
                'title' => 'SISTEMA DE BIENES DE USO (PATRIMONIO)',
                'url' => 'http://bienesdeuso.hospital.uncu.edu.ar:8069/web/login'
            ],
            [
                'title' => 'ENVÍO NOVEDADES',
                'url' => 'http://172.22.112.213/admision/'
            ],
            [
                'title' => 'TABLERO DE COMANDOS',
                'url' => 'https://tablerouniversitario.alephoo.com/'
            ],
            [
                'title' => 'SIMULADOR DE PRECIOS',
                'url' => 'http://172.22.112.14/sprecio/simulador/view'
            ],
            [
                'title' => 'COMDOC 3',
                'url' => 'https://comdoc3.intranet.uncu.edu.ar/comdocII/webtier/Signin'
            ],
            [
                'title' => 'SISTEMA DE ADMINISTRACIÓN DE MATERIALES',
                'url' => 'http://172.22.112.213/stockmateriales/login'
            ],
            [
                'title' => 'TICKETS PARA PATRIMONIO',
                'url' => 'http://172.22.112.213/tpatrimonio/'
            ],
            [
                'title' => 'SISTEMA DE PRODUCTIVIDAD SIIHU',
                'url' => 'http://172.22.112.17/siihu/'
            ],
            [
                'title' => 'SIST. INFORMES CARDIOLÓGICOS',
                'url' => 'http://172.22.112.213/cardiologia/'
            ],
            [
                'title' => 'SUDOCU',
                'url' => null
            ],
            [
                'title' => 'SISTEMA DE MANTENIMIENTO',
                'url' => 'http://172.22.112.22:10006/login'
            ],
        ];

        foreach ($administrativaItems as $index => $item) {
            $create(
                $item['title'],
                $gestionAdministrativa->id,
                $index + 1,
                $item['url']
            );
        }


        /*
        |--------------------------------------------------------------------------
        | GESTIÓN ASISTENCIAL
        |--------------------------------------------------------------------------
        */

        $asistencialItems = [
            [
                'title' => 'SISTEMA DE ALEPHOO UNCUYO',
                'url' => 'https://universitario.alephoo.com/admin/login_form',
            ],
            [
                'title' => 'SEGUIMIENTO DE TURNOS',
                'url' => 'http://172.22.112.22:10005/login',
            ],
            [
                'title' => 'SISTEMA DE ANATOMÍA PATOLÓGICA',
                'url' => 'http://172.22.112.22:10001',
            ],
            [
                'title' => 'SISTEMA DE PRODUCTIVIDAD HEXIUM',
                'url' => 'http://bienesdeuso.hospital.uncu.edu.ar:8069/web/login',
            ],
            [
                'title' => 'REPOSITORIO DE INFORMES MÉDICOS',
                'url' => 'http://172.22.112.213/cardiologia/',
            ],
            [
                'title' => 'SISTEMA DE GESTIÓN DE PRESUPUESTOS',
                'url' => 'http://172.22.118.101:81/presupuestos/public/',
            ],
            [
                'title' => 'SISTEMAS DE REPORTES (SIIH)',
                'url' => 'http://siih2.sistemas.hospital.uncu.edu.ar/login',
            ],
            [
                'title' => 'DIAGNÓSTICOS DE OSEP',
                'url' => null,
            ],
            [
                'title' => 'FORMULARIO VIH',
                'url' => null,
            ],
            [
                'title' => 'PADRÓN DAMSU',
                'url' => 'http://172.22.112.213/damsu/',
            ],
            [
                'title' => 'RECETARIO OSEP',
                'url' => 'https://www.osep.mendoza.gov.ar/webapp_pri/action/index',
            ],
            [
                'title' => 'CONSULTA HC',
                'url' => 'http://172.22.112.14/consultahc/',
            ],
            [
                'title' => 'PLANILLA DE CONTINGENCIAS',
                'url' => null,
            ],
            [
                'title' => 'SISTEMA DE IMÁGENES (BIOBOX)',
                'url' => 'https://local.cli.biobox.com.ar/site/login',
            ],
        ];

        foreach ($asistencialItems as $index => $item) {
            $create(
                $item['title'],
                $gestionAsistencial->id,
                $index + 1,
                $item['url']
            );
        }

        /*
        |--------------------------------------------------------------------------
        | GESTIÓN ACADÉMICA
        |--------------------------------------------------------------------------
        */

        $academicaItems = [
            [
                'title' => 'SISTEMA AULAS 2025',
                'url' => 'http://172.22.112.22:10002/',
            ],
            [
                'title' => 'AULA VIRTUAL',
                'url' => 'http://ead.hospital.uncu.edu.ar/moodle/',
            ],
            [
                'title' => 'SERVICIO DE PASANTÍAS Y PRÁCTICAS',
                'url' => null,
            ],
            [
                'title' => 'SISTEMA DE CERTIFICADOS',
                'url' => 'http://172.22.118.101:81/sistemacertificados/public/',
            ],
        ];

        foreach ($academicaItems as $index => $item) {
            $create(
                $item['title'],
                $gestionAcademica->id,
                $index + 1,
                $item['url']
            );
        }


        /*
        |--------------------------------------------------------------------------
        | CONTROL DE GESTIÓN
        |--------------------------------------------------------------------------
        */

        $controlGestionItems = [
            [
                'title' => 'REPOSITORIO DE PROCESOS',
                'url' => null,
            ],
            [
                'title' => 'TICKETS PARA CONTROL DE GESTIÓN',
                'url' => 'http://172.22.112.213/controldegestion/',
            ],
            [
                'title' => 'RECEPCIÓN DE PROPUESTAS Y MEJORAS',
                'url' => 'http://172.22.112.213/controldegestion/',
            ],
        ];

        foreach ($controlGestionItems as $index => $item) {
            $create(
                $item['title'],
                $controlGestion->id,
                $index + 1,
                $item['url']
            );
        }


        // =========================================================
        // COMUNICACIÓN EN LÍNEA
        // =========================================================

        $comunicacionItems = [
            [
                'title' => 'WEBMAIL',
                'url' => 'https://correo.hospital.uncu.edu.ar/',
            ],
            [
                'title' => 'FORO INTERNO',
                'url' => null,
            ],
            [
                'title' => 'GRILLA DE TELÉFONOS',
                'url' => 'http://172.22.112.22:10007/?q=',
            ],
            [
                'title' => 'MESA DE AYUDA',
                'url' => 'http://172.22.112.213/tickets/',
            ],
        ];

        foreach ($comunicacionItems as $index => $item) {
            $create(
                $item['title'],
                $comunicacion->id,
                $index + 1,
                $item['url']
            );
        }


        /*
        |--------------------------------------------------------------------------
        | COVID-19
        |--------------------------------------------------------------------------
        */

        $create(
            'BOLETÍN DIARIO',
            $covid->id,
            1,
            null
        );

        $biblioteca = $create(
            'BIBLIOTECA',
            $covid->id,
            2
        );

        $create(
            'ATENEOS',
            $covid->id,
            3,
            null
        );

        $create(
            'PROYECTOS DE INVESTIGACIÓN',
            $covid->id,
            4,
            null
        );

        $create(
            'INSTRUCTIVOS',
            $covid->id,
            5,
            null
        );


        // =========================================================
        // BIBLIOTECA
        // =========================================================

        $bibliotecaItems = [
            [
                'title' => 'GENÉTICA',
                'url' => null,
            ],
            [
                'title' => 'NUTRICIÓN',
                'url' => null,
            ],
            [
                'title' => 'CLÍNICA QUIRÚRGICA',
                'url' => null,
            ],
            [
                'title' => 'GINECO',
                'url' => null,
            ],
            [
                'title' => 'PSICOLOGÍA/PSIQUIATRÍA',
                'url' => null,
            ],
            [
                'title' => 'TRABAJO SOCIAL',
                'url' => null,
            ],
            [
                'title' => 'DERMATOLOGÍA',
                'url' => null,
            ],
            [
                'title' => 'DIAGNÓSTICO POR IMÁGENES',
                'url' => null,
            ],
            [
                'title' => 'GASTROENTEROLOGÍA',
                'url' => null,
            ],
            [
                'title' => 'ONCOLOGÍA',
                'url' => null,
            ],
            [
                'title' => 'NEUROLOGÍA',
                'url' => null,
            ],
        ];

        foreach ($bibliotecaItems as $index => $item) {
            $create(
                $item['title'],
                $biblioteca->id,
                $index + 1,
                $item['url']
            );
        }


        /*
        |--------------------------------------------------------------------------
        | UNIDAD QUIRÚRGICA
        |--------------------------------------------------------------------------
        */

        $create(
            'PRESTACIONES',
            $unidadQuirurgica->id,
            1,
            null
        );

        $create(
            'PRESTACIÓN',
            $unidadQuirurgica->id,
            2,
            'https://www.youtube.com/watch?v=dwAZ7xHKrsc'
        );

        $create(
            'REGLAMENTOS',
            $unidadQuirurgica->id,
            3,
            null
        );

        $guiasQuirofano = $create(
            'GUÍAS DE QUIRÓFANO',
            $unidadQuirurgica->id,
            4
        );

        $create(
            'GUÍA DE PROFILAXIS ANTIBIÓTICA QUIRÚRGICA',
            $guiasQuirofano->id,
            1,
            null
        );

        // =========================================================
        // FORMULARIOS ADMINISTRATIVOS
        // =========================================================

        $formulariosAdministrativosItems = [
            [
                'title' => 'FORMULARIO DECLARACIÓN JURADA',
                'url' => null,
            ],
            [
                'title' => 'FORMULARIO INSCRIPCIÓN CONCURSOS',
                'url' => null,
            ],
            [
                'title' => 'FORMULARIO NOTA',
                'url' => null,
            ],
            [
                'title' => 'FORM. LICENCIA PERSONAL DE APOYO ACADÉMICO',
                'url' => null,
            ],
            [
                'title' => 'FORMULARIO LICENCIA PERSONAL ASISTENCIAL',
                'url' => null,
            ],
            [
                'title' => 'FORMULARIOS INSCRIPCIÓN CONCURSOS EFECTIVOS',
                'url' => null,
            ],
            [
                'title' => 'ANEXO IV – DECLARACIÓN JURADA DE ANTECEDENTES – 2024',
                'url' => null,
            ],
            [
                'title' => 'ANEXO X-FORMULARIO DE ACEPTACIÓN DE NOTIFICACIÓN ELECTRÓNICA-2024',
                'url' => null,
            ],
        ];

        foreach ($formulariosAdministrativosItems as $index => $item) {
            $create(
                $item['title'],
                $formulariosAdministrativos->id,
                $index + 1,
                $item['url']
            );
        }
    }
}
