const employeeSql = `SELECT e.id, 
                        CONCAT(e.first_name, ' ', e.last_name) AS name, 
                        roles.title AS title,
                        roles.salary AS salary,
                        departments.name AS department,
                        CONCAT(m.first_name, ' ', m.last_name) AS manager_name
                        FROM employees e
                        LEFT JOIN employees m ON
                        m.id = e.manager_id 
                        LEFT JOIN roles ON roles.id = e.role_id
                        LEFT JOIN departments ON departments.id = roles.department_id`;

const roleSql = `SELECT roles.id, roles.title, roles.salary, departments.name AS department
                    FROM roles
                    LEFT JOIN departments
                    ON roles.department_id = departments.id`;

module.exports = { employeeSql, roleSql }