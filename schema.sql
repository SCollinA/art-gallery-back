create table galleries (
    name varchar(100)
);

create table artworks (
    title varchar(100),
    width integer,
    height integer,
    medium varchar(200),
    image bytea,
    sold boolean
);