INSERT INTO departments (name)
VALUES
('Sales'),
('Engineering'),
('Finance'),
('Legal');

INSERT INTO roles (title, salary, department_id)
VALUES
('Sales Lead', 100000, 1),
('Salesperson', 80000, 1),
('Lead Engineer', 150000, 2),
('Software Engineer', 120000, 2),
('Account Manager', 160000, 3),
('Accountant', 125000, 3);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES 
('Andy', 'Bill', 1, NULL),
('Ben', 'Aniston', 2, 1);

