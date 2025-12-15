import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, InputGroup, Button, ListGroup, Badge, Spinner } from 'react-bootstrap';
import { productsAPI } from '../services/api';

const SearchProduct = () => {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lowestPrice, setLowestPrice] = useState(null);

  useEffect(() => {
    // prefetch products once on mount
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productsAPI.getAll();
      const all = res.data.products || [];
      setProducts(all);
      setResults(all);
      computeLowest(all);
    } catch (err) {
      console.error('Error fetching products for search', err);
      setProducts([]);
      setResults([]);
      setLowestPrice(null);
    } finally {
      setLoading(false);
    }
  };

  const safePrice = (p) => {
    const candidates = [p.currentPrice, p.price, p.offerPrice, p.lowestPrice, p.priceRaw, p?.price];
    for (const c of candidates) {
      if (c === undefined || c === null) continue;
      const n = parseFloat(String(c).replace(/[^0-9.\-]/g, ''));
      if (!Number.isNaN(n)) return n;
    }
    return Infinity;
  };

  const computeLowest = (list) => {
    if (!Array.isArray(list) || list.length === 0) {
      setLowestPrice(null);
      return;
    }
    const min = list.reduce((acc, item) => {
      const p = safePrice(item);
      return p < acc ? p : acc;
    }, Infinity);
    setLowestPrice(Number.isFinite(min) ? min : null);
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    const q = query.trim();
    setLoading(true);
    try {
      // local filter
      let filtered = products;
      if (q) {
        const qlc = q.toLowerCase();
        filtered = products.filter(p => {
          return (
            (p.name || '').toLowerCase().includes(qlc) ||
            (p.platform || '').toLowerCase().includes(qlc) ||
            (p.url || '').toLowerCase().includes(qlc)
          );
        });
      }

      // fetch sponsored items from backend (server should call Google/SerpAPI)
      let sponsored = [];
      try {
        const sres = await productsAPI.getSponsored(q || '');
        const items = sres?.data?.items || [];
        sponsored = items.map((it, idx) => ({
          _id: `sponsored-${idx}-${String(Math.random()).slice(2,8)}`,
          name: it.title || it.name || 'Sponsored',
          platform: it.seller || it.source || it.seller || 'Sponsored',
          url: it.url || it.link || '#',
          currentPrice: it.price,
          sponsored: true,
        }));
      } catch (sErr) {
        console.warn('Sponsored fetch failed', sErr);
        sponsored = [];
      }

      const combined = [...sponsored, ...filtered];
      setResults(combined);
      computeLowest(combined);
    } catch (err) {
      console.error('Search error', err);
      setResults([]);
      setLowestPrice(null);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults(products);
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2 className="text-white">Search Product</h2>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={8} lg={6}>
          <Card>
            <Card.Body>
              <Form onSubmit={handleSearch}>
                <InputGroup>
                  <Form.Control
                    placeholder="Search by name, platform or URL"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <Button variant="primary" type="submit">Search</Button>
                  <Button variant="outline-secondary" onClick={clearSearch}>Clear</Button>
                </InputGroup>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Results {lowestPrice != null && <Badge bg="warning" className="ms-2">Lowest: ${lowestPrice}</Badge>}</Card.Title>
              {loading ? (
                <div className="text-center my-4"><Spinner animation="border" /></div>
              ) : (
                <ListGroup variant="flush">
                  {results.length === 0 ? (
                    <ListGroup.Item className="text-center text-muted">No products found</ListGroup.Item>
                  ) : (
                    results.map(p => (
                      <ListGroup.Item key={p._id} className="d-flex justify-content-between align-items-start">
                        <div>
                          <strong>{p.name}</strong>
                          <div className="small text-muted">{p.platform} • {p.url}</div>
                        </div>
                        <div className="text-end">
                          <div><Badge bg="success">${p.currentPrice}</Badge></div>
                          <div className="small text-muted">Last: {new Date(p.lastChecked).toLocaleDateString()}</div>
                        </div>
                      </ListGroup.Item>
                    ))
                  )}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SearchProduct;
