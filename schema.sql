create table galleries (
    id serial primary key,
    name varchar(100)
);

create table artworks (
    id serial primary key,
    galleryId integer references gallery (id) on delete cascade,
    title varchar(100),
    width integer,
    height integer,
    medium varchar(200),
    image bytea,
    sold boolean
);