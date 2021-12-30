select r.* from GCGT_RE_READING r
inner join GCGT_RE_MEASUREMENT_POINT measure on measure.ID_MEASURING_POINT = r.ID_MEASURING_POINT
inner join GCCOM_SECTOR_SUPPLY supply on supply.ID_SECTOR_SUPPLY = measure.ID_SECTOR_SUPPLY
inner join GCCOM_CONTRACTED_SERVICE contracts on contracts.ID_SECTOR_SUPPLY = supply.ID_SECTOR_SUPPLY
inner join GCCOM_PAYMENT_FORM payments on payments.ID_PAYMENT_FORM = contracts.ID_PAYMENT_FORM 
inner join GCCD_RELATIONSHIP relations on relations.COD_CUSTOMER = payments.ID_CUSTOMER
inner join GCCC_CUSTOMER_TYPE customer on customer.COD_DEVELOP = relations.CUSTOMER_TYPE
where upper(customer.NAME_TYPE) = upper('Commercial');