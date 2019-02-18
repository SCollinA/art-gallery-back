create table gallery (
    id serial primary key,
    name varchar(100)
);

create table artworks (
    id serial primary key,
    gallery_id integer references gallery (id),
    title varchar(100),
    width integer,
    height integer,
    medium varchar(200),
    image bytea,
    sold boolean
);