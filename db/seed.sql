INSERT INTO department (name)
VALUES ('Software'),
('Administration');

INSERT INTO role (title, salary, department_id)
VALUES ('Developer',100000.55,1),
('Assistant',60000.22,2),
('Senior Developer',200000.66,1);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('Page','Black',1,null),
('Steve','Steverson',3,null),
('Bob','Glass',2,null);