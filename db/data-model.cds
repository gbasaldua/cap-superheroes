using {
    cuid,
    managed
} from '@sap/cds/common';

namespace gbasdeveloper;

entity superheroe : managed {
    key id               : String;
        nombreSuperheroe : String(100);
        nombre           : String(100);
        franquicia       : String(20);
        telefono         : String(9);
        edad             : String(3);
        fuerza           : String(3);
        destreza         : String(3);
        intelecto        : String(3);
}
